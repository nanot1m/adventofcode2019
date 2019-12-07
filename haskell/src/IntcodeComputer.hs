module IntcodeComputer
    ( Program(..)
    , ProgramStatus(..)
    , runProgramm
    )
where

import           Lib


data ProgramStatus = Running | Halted | WaitingForInput deriving (Show, Eq)

data Program = Program {
    registries :: [Int],
    input :: [Int],
    output :: [Int],
    position :: Int,
    status :: ProgramStatus
} deriving Show

data Command =
    SumC Int Int Int
    | ProdC Int Int Int
    | InputC Int
    | OutputC Int
    | JumpIfTrueC Int Int
    | JumpIfFalseC Int Int
    | LessThanC Int Int Int
    | EqualsC Int Int Int
    | Halt
    deriving Show

runProgramm :: Program -> Program
runProgramm program =
    let command  = parseCommand program
        program' = runCommand program command
    in  case status program' of
            Halted          -> program'
            WaitingForInput -> program'
            Running         -> runProgramm program'

runCommand :: Program -> Command -> Program
runCommand program command = case command of
    (SumC l r p) -> program
        { registries = replaceNth p (l + r) (registries program)
        , position   = position program + 4
        , status     = Running
        }
    (ProdC l r p) -> program
        { registries = replaceNth p (l * r) (registries program)
        , position   = position program + 4
        , status     = Running
        }
    (InputC p) -> case input program of
        [] -> program { status = WaitingForInput }
        _  -> program
            { registries = replaceNth p (head $ input program)
                               $ registries program
            , input      = tail $ input program
            , position   = position program + 2
            , status     = Running
            }
    (OutputC p) -> program
        { output   = output program ++ [registries program !! p]
        , position = position program + 2
        , status   = Running
        }
    (JumpIfTrueC l p) -> program
        { position = if l == 0 then position program + 3 else p
        , status   = Running
        }
    (JumpIfFalseC l p) -> program
        { position = if l == 0 then p else position program + 3
        , status   = Running
        }
    (LessThanC l r p) -> program
        { registries = replaceNth p (if l < r then 1 else 0)
                           $ registries program
        , position   = position program + 4
        , status     = Running
        }
    (EqualsC l r p) -> program
        { registries = replaceNth p (if l == r then 1 else 0)
                           $ registries program
        , position   = position program + 4
        , status     = Running
        }
    Halt -> program { status = Halted }

parseCommand :: Program -> Command
parseCommand program =
    let pos             = position program
        commandAndModes = registries program !! pos
        command         = commandAndModes `mod` 100
        modes           = commandAndModes `div` 100
        mode1           = modes `mod` 10
        mode2           = (modes `div` 10) `mod` 10
        mode3           = (modes `div` 100) `mod` 10
        p' mode valPos = param (registries program) mode (valPos + pos)
        p'' valPos = registries program !! (pos + valPos)
    in  case command of
            1  -> SumC (p' mode1 1) (p' mode2 2) (p'' 3)
            2  -> ProdC (p' mode1 1) (p' mode2 2) (p'' 3)
            3  -> InputC (p'' 1)
            4  -> OutputC (p'' 1)
            5  -> JumpIfTrueC (p' mode1 1) (p' mode2 2)
            6  -> JumpIfFalseC (p' mode1 1) (p' mode2 2)
            7  -> LessThanC (p' mode1 1) (p' mode2 2) (p'' 3)
            8  -> EqualsC (p' mode1 1) (p' mode2 2) (p'' 3)
            99 -> Halt
            _  -> error $ "Unknown command " ++ show command

param :: [Int] -> Int -> Int -> Int
param commands mode valPos = case mode of
    0 -> commands !! (commands !! valPos)
    1 -> commands !! valPos
