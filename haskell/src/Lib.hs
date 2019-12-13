module Lib where

import           Data.Char                      ( isSpace )
import           Data.List.Split

trim :: String -> String
trim = f . f where f = reverse . dropWhile isSpace

readInputForDay :: Int -> IO String
readInputForDay day = do
  text <- readFile $ "../input/day" ++ show day ++ ".input.txt"
  return $ trim text

readInputForDayAsCSV :: Int -> IO [String]
readInputForDayAsCSV day = splitByComma <$> readInputForDay day

splitByChar :: Char -> String -> [String]
splitByChar char input = split input []
 where
  split []      t = [t]
  split (a : l) t = if a == char then t : split l [] else split l (t ++ [a])

splitByComma :: String -> [String]
splitByComma = splitByChar ','

modifyNth :: Int -> (a -> a) -> [a] -> [a]
modifyNth _ _ [] = []
modifyNth n modify (h : t) | n == 0    = modify h : t
                           | otherwise = h : modifyNth (n - 1) modify t

replaceNth :: Int -> a -> [a] -> [a]
replaceNth n newVal = modifyNth n (const newVal)

chunkBy :: Int -> [a] -> [[a]]
chunkBy = chunksOf
