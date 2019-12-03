module Lib
    ( readInputForDay
    , splitByComma
    , replaceNth
    , modifyNth
    )
where

readInputForDay :: Int -> IO String
readInputForDay day = readFile $ "../input/day" ++ show day ++ ".input.txt"

splitByComma :: String -> [String]
splitByComma input = split input []
  where
    split []      t = [t]
    split (a : l) t = if a == ',' then t : split l [] else split l (t ++ [a])

modifyNth :: Int -> (a -> a) -> [a] -> [a]
modifyNth _ _ [] = []
modifyNth n modify (h : t) | n == 0    = modify h : t
                           | otherwise = h : modifyNth (n - 1) modify t

replaceNth :: Int -> a -> [a] -> [a]
replaceNth n newVal = modifyNth n (const newVal)
