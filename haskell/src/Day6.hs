
module Day6
    ( part1
    , part2
    )
where

import           Lib
import           Data.List
import           Debug.Trace

data OrbitTree = OrbitNode String [OrbitTree] deriving Show

parseInputLine = (\x -> (head x, head (tail x))) . splitByChar ')'
buidlInputTree input = buildTree input (getInitNode "COM" input)
prepareInput =
    buidlInputTree . map parseInputLine . lines <$> readInputForDay 6

part1 = orbitLengthSum <$> prepareInput

part2 = do
    input <- prepareInput
    return $ case findNearestParentNode "YOU" "SAN" input of
        (Just node) -> getPathLen "YOU" node + getPathLen "SAN" node
        Nothing      -> 0

findOrbitNodes :: String -> [(String, String)] -> [OrbitTree]
findOrbitNodes name =
    map (\(left, right) -> OrbitNode left [OrbitNode right []])
        . filter (\(left, _) -> left == name)

getInitNode :: String -> [(String, String)] -> OrbitTree
getInitNode name = head . findOrbitNodes name

joinNodes :: OrbitTree -> [OrbitTree] -> OrbitTree
joinNodes (OrbitNode rootName rootChildren) children =
    let children' = map (\(OrbitNode _ children'') -> children'') children
    in  OrbitNode rootName (rootChildren ++ concat children')

buildTree :: [(String, String)] -> OrbitTree -> OrbitTree
buildTree input (OrbitNode rootName children) =
    let buildTree' = buildTree input
        childMapper child@(OrbitNode childName _) =
                buildTree' $ joinNodes child (findOrbitNodes childName input)
    in  OrbitNode rootName $ map childMapper children

orbitLengthSum :: OrbitTree -> Int
orbitLengthSum = orbitLengthSumHelper 0
  where
    orbitLengthSumHelper acc (OrbitNode _ []) = acc
    orbitLengthSumHelper acc (OrbitNode _ children) =
        ((+ acc) . sum . map (orbitLengthSumHelper (acc + 1))) children

hasChildNode :: String -> OrbitTree -> Bool
hasChildNode name (OrbitNode name' children) =
    name == name' || any (hasChildNode name) children

findNearestParentNode :: String -> String -> OrbitTree -> Maybe OrbitTree
findNearestParentNode = findParentNodes' Nothing
  where
    findParentNodes' result nameA nameB (OrbitNode name' children) =
        let hasAandB node = hasChildNode nameA node && hasChildNode nameB node
            parent' = find hasAandB children
        in  case parent' of
                (Just node') -> findParentNodes' (Just node') nameA nameB node'
                Nothing      -> result

getPathLen :: String -> OrbitTree -> Int
getPathLen = getPathLen' 0
  where
    getPathLen' acc name (OrbitNode name' []) =
        if name == name' then acc - 1 else 0
    getPathLen' acc name (OrbitNode name' children) = if name == name'
        then acc - 1
        else sum $ map (getPathLen' (acc + 1) name) children
