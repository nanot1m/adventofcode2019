module IntcodeComputer
    ( Program(..)
    , ProgramStatus(..)
    , Int
    , runProgramm
    , fromRegistries
    )
where

import           Lib
import           Data.Map                      as M
import           Debug.Trace
import           Data.Maybe

data ProgramStatus = Running | Halted | WaitingForInput deriving (Show, Eq)

type Regs = M.Map Int Int

data Program = Program {
    registries :: Regs,
    input :: [Int],
    output :: [Int],
    position :: Int,
    status :: ProgramStatus,
    relativeBase :: Int
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
    | AdjustRB Int
    | Halt
    deriving Show

fromRegistries :: [Int] -> Program
fromRegistries registries = Program { registries   = regs
                                    , input        = []
                                    , output       = []
                                    , position     = 0
                                    , status       = Running
                                    , relativeBase = 0
                                    }
    where regs = M.fromList $ zip [0 ..] registries

runProgramm :: Program -> Program
runProgramm program =
    let command  = parseCommand program
        program' = runCommand program command
    in  case status program' of
            Halted          -> program'
            WaitingForInput -> program'
            Running         -> runProgramm program'

runCommand :: Program -> Command -> Program
runCommand program@Program { registries = regs, position = pos } command =
    case command of
        (SumC l r p) -> program { registries = M.insert p (l + r) regs
                                , position   = pos + 4
                                , status     = Running
                                }
        (ProdC l r p) -> program { registries = M.insert p (l * r) regs
                                 , position   = pos + 4
                                 , status     = Running
                                 }
        (InputC p) -> case input program of
            [] -> program { status = WaitingForInput }
            _  -> program { registries = M.insert p (head $ input program) regs
                          , input      = tail $ input program
                          , position   = pos + 2
                          , status     = Running
                          }
        (OutputC p) -> program { output   = output program ++ [p]
                               , position = pos + 2
                               , status   = Running
                               }
        (JumpIfTrueC l p) -> program { position = if l == 0 then pos + 3 else p
                                     , status   = Running
                                     }
        (JumpIfFalseC l p) -> program
            { position = if l == 0 then p else pos + 3
            , status   = Running
            }
        (LessThanC l r p) -> program
            { registries = M.insert p (if l < r then 1 else 0) regs
            , position   = pos + 4
            , status     = Running
            }
        (EqualsC l r p) -> program
            { registries = M.insert p (if l == r then 1 else 0) regs
            , position   = pos + 4
            , status     = Running
            }
        (AdjustRB p) -> program { relativeBase = relativeBase program + p
                                , status       = Running
                                , position     = pos + 2
                                }
        Halt -> program { status = Halted }

getP :: Int -> Regs -> Int
getP pos regs = fromMaybe 0 (M.lookup pos regs)

parseCommand :: Program -> Command
parseCommand p@Program { registries = regs, position = pos } = case command of
    1  -> SumC (get p1) (get p2) p3
    2  -> ProdC (get p1) (get p2) p3
    3  -> InputC p1
    4  -> OutputC (get p1)
    5  -> JumpIfTrueC (get p1) (get p2)
    6  -> JumpIfFalseC (get p1) (get p2)
    7  -> LessThanC (get p1) (get p2) p3
    8  -> EqualsC (get p1) (get p2) p3
    9  -> AdjustRB (get p1)
    99 -> Halt
    _  -> error $ "Unknown command " ++ show command
  where
    get             = flip getP regs
    commandAndModes = get pos
    command         = commandAndModes `mod` 100
    modes           = commandAndModes `div` 100
    p1              = param p (modes `mod` 10) (pos + 1)
    p2              = param p ((modes `div` 10) `mod` 10) (pos + 2)
    p3              = param p ((modes `div` 100) `mod` 10) (pos + 3)

param :: Program -> Int -> Int -> Int
param Program { registries = regs, relativeBase = rb } mode pos = case mode of
    0 -> getP pos regs
    1 -> pos
    2 -> rb + getP pos regs
