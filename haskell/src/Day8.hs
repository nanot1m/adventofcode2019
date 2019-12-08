module Day8
    ( part1
    , part2
    )
where

import           Lib
import           Data.List
import           Data.Ord

prepareInput = readInputForDay 8

width = 25
height = 6

part1 =
    (\x -> countChar '1' x * countChar '2' x)
        .   minimumBy (comparing (countChar '0'))
        .   chunkBy (width * height)
        <$> prepareInput

part2 =
    putStr
        .   drawImage
        .   map (head . dropWhile (== '2'))
        .   transpose
        .   chunkBy (width * height)
        =<< prepareInput


countChar :: Char -> String -> Int
countChar ch = length . filter (== ch)

drawImage :: String -> String
drawImage = unlines . chunkBy width . map (\x -> if x == '1' then 'O' else ' ')
