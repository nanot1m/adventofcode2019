module Day4
    ( part1
    , part2
    )
where

import           Lib
import           Data.List

prepareInput = do
    (min : max : _) <-
        map (read :: String -> Int) . splitByChar '-' <$> readInputForDay 4
    return (min, max)

part1 = do
    (min, max) <- prepareInput
    return $ length [ i | i <- [min .. max], isValid i ]

part2 = do
    (min, max) <- prepareInput
    return $ length [ i | i <- [min .. max], isValid' i ]

isValid :: Int -> Bool
isValid num = isValidHelper False (num `mod` 10) (num `div` 10)
  where
    isValidHelper :: Bool -> Int -> Int -> Bool
    isValidHelper hasAdj prev rest =
        let isLast       = rest < 10
            prev'        = rest `mod` 10
            rest'        = rest `div` 10
            hasAdj'      = hasAdj || prev' == prev
            isDecreasing = prev' > prev
        in  not isDecreasing && if isLast
                then hasAdj'
                else isValidHelper hasAdj' prev' rest'

isValid' :: Int -> Bool
isValid' num = isValidHelper [num `mod` 10] (num `mod` 10) (num `div` 10)
  where
    isValidHelper :: [Int] -> Int -> Int -> Bool
    isValidHelper group prev rest =
        let isLast = rest < 10
            prev'  = rest `mod` 10
            rest'  = rest `div` 10
            group' | prev' == head group = prev' : group
                   | length group == 2   = group
                   | otherwise           = [prev']
            isDecreasing = prev' > prev
        in  not isDecreasing && if isLast
                then length group' == 2
                else isValidHelper group' prev' rest'
