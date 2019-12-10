module Main where


import           System.Environment
import qualified Day1
import qualified Day2
import qualified Day4
import qualified Day5
import qualified Day6
import qualified Day7
import qualified Day8
import qualified Day9
import qualified Day10

main :: IO ()
main = do
    [dayN] <- getArgs
    case dayN of
        "1"  -> printResults Day1.part1 Day1.part2
        "2"  -> printResults Day2.part1 Day2.part2
        "4"  -> printResults Day4.part1 Day4.part2
        "5"  -> printResults Day5.part1 Day5.part2
        "6"  -> printResults Day6.part1 Day6.part2
        "7"  -> printResults Day7.part1 Day7.part2
        "8"  -> printResults Day8.part1 Day8.part2
        "9"  -> printResults Day9.part1 Day9.part2
        "10" -> printResults Day10.part1 Day10.part2
        _    -> putStrLn "Not implemented"


printResults a b = do
    part1 <- a
    part2 <- b
    putStrLn $ "Part 1: " ++ show part1
    putStrLn $ "Part 2: " ++ show part2
