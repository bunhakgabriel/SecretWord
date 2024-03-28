// CSS
import './App.css'

// React
import { useCallback, useEffect, useState} from 'react'

// data 
import { wordsList } from './data/words'

// components
import StartScreen from './components/StartScreen'
import Game from './components/Game'
import GameOver from './components/GameOver'

// stages são as 3 paginas do jogo
const stages = [ 
  {id: 1, name: 'start'},
  {id: 2, name: 'game'},
  {id: 3, name: 'end'}
]

const guessesQty = 3

function App() {

  const [gameStage, setGameStage] = useState(stages[0].name)
  const [words] = useState(wordsList)

  const [pickedWord, setPickedWord] = useState('') // pickedWord = palavra escolhida
  const [pickedCategory, setPickedCategory] = useState('') // pickedCategory = categoria escolhida
  const [letters, setLetters] = useState([]) // letters = vai ser um array com as letras da palavra escolhida/sorteada

  const [guessedLetters, setGuessedLetters] = useState([]) // guessedLetters = vai ser um array com as letras advinhadas 
  const [wrongLetters, setWrongLetters] = useState([]) // wrongLetters = vai ser um array com as letras erradas
  const [guesses, setGuesses] = useState(guessesQty) // guesses = vai ser a quantidade de chances que o usuario ainda tem, o usuario vai começar com 3 chances
  const [score, setScore] = useState(0) // score = vai ser a pontuação do usuario, cada usuario começa com zero pontos

  const pickWordAndCategory = useCallback(() => {
    // pick a random category
    const categories = Object.keys(words)  // O Object.keys() retorna um objeto Array Iterator com as chaves de um objeto. Nesse caso as chaves do objeto Word, que são todas as categorias
    const category = categories[Math.floor(Math.random() * Object.keys(categories).length)]     // A constante category vai receber um numero que vai de 0 ao numero de categorias que eu tenho

    // pick a random word
    const word = words[category][Math.floor(Math.random() * words[category].length)]

    console.log(word)

    return {word, category}
    //Essa função vai basicamente escolher uma categoria aleatória dentre todas as categorias disponiveis, e posteriormente vai escolher uma palavra aleatória dessa categoria
  }, [words])

  // starts the secret word game
  const startGame = useCallback(() => { 
    // clear all letters
    clearLetterStates()

    // pick word and pick category
    const { word, category } = pickWordAndCategory() // a função pickWordAndCategory() retorna um objeto com duas propriedades, a primeira propriedade é a palavra escolhida, e a segunda é a categoria escolhida, nós estamos desestruturando esse objeto para as constantes word(palavra) e category(categoria)

    // Create array of letters // Aqui nós vamos pegar a palavra e transforma-la em letras
    let wordLetters = word.split('')
    wordLetters = wordLetters.map( letra => letra.toLowerCase() ) //Vamos fazer todas as letras do array ficarem minusculas

    // fill states // vamos os estados de palavra, categoria e letras
    setPickedWord(word)
    setPickedCategory(category)
    setLetters(wordLetters)

    setGameStage(stages[1].name)
  }, [pickWordAndCategory])

  // process the latter input
  const verifyLetter = (letter) => {
    const normalizedLetter = letter.toLowerCase() // Se o usuario digitar uma letra maisuscula nós vamos converte-la em minuscula, pois a palavra sorteada esta com letras minusculas também

    // Check if letter has already been utilized // Vamos checar se a letra ja foi utilizada, se ela ja foi digitada vamos encerrar a função até que o usuario digite uma letra que nao foi utilizada
    if(guessedLetters.includes(normalizedLetter) || wrongLetters.includes(normalizedLetter)){
      return
    }

    // push guessed letter or remove a guess // incluir as letras advinhadas pelo usuario para o array letras accertadas ou o array de letras erradas
    if(letters.includes(normalizedLetter)){
      setGuessedLetters([...guessedLetters, normalizedLetter])
    } else {
      setWrongLetters([...wrongLetters, normalizedLetter])
      //setGuesses(guesses - 1)
      setGuesses((actualGuesses) => actualGuesses - 1)
    }
  }

  const clearLetterStates = () => {
    setGuessedLetters([])
    setWrongLetters([])
  }

  // Check if guesses ended // O primeiro argumento é uma função, o segundo argumento é a variavel dinâmica de monitoramento // Temos obrigatoriamente que ter um dado sendo monitorado
  // useEffect vai monitorar algum dado, nesse caso ele vai monitorar o guesses, que é a quantidade de chances do usuario, quando essa quantidade chegar em 0, ele vai fazer o programa passar para o próximo estagio, que é o game over
  useEffect(() => {
    if(guesses <= 0){
      // reset all states // vamos ter que fazer uma função que apague tudo para iniciar o jogo zerado
      clearLetterStates()

      setGameStage(stages[2].name)
    }
  }, [guesses])

  // Check win condition // Vamos checar uma condição de vitória do usuário
  useEffect(() => {

    const uniqueLetters = [... new Set(letters)] // Esse new set deixa os items unicos em um array (não tera items repetidos), então nós vamos pegar o array letters da palavra original que foi sorteada, e tranforma-lo num array de letras unicas, pois o array original pode ter letras repetidas, nós vamos fazer isso pois o array de letras que o usuario digita (guessedLetters) não tem letras repetidas, e pra fazer a condição de vitória, precisamos dos dois arrays no mesmo estado 

    // win condition //Código ineficiente, ANALISAR
    if(guessedLetters.length === uniqueLetters.length && uniqueLetters.length != 0 && guessedLetters.length != 0){
      // add score
      setScore((actualScore) => (actualScore + 100))

      // restart game with new word
      //startGame() //Não é boa pratica usar essa função (startGame()) dentro desse useEffect, pois sempre que o estado da variavel monitorada mudar, ele vai tentar executar todo o código dentro do useEffect, executando uma função varias vezes, neste caso em especifico não vai acontecer pois a startGame() esta dentro do if, mais não é uma boa pratica utilizar funções dentro do useEffect, é necessário tomar muito cuidado fazendo isso, vamos resolver esse problema com use callback na linha 52
      startGame()
    }
  }, [guessedLetters])


  // restarts the game
  const retry = () => {
    setScore(0)
    setGuesses(guessesQty)
    setGameStage(stages[0].name)
  }

  return (
    <div className='App'>
      {gameStage === 'start' && <StartScreen startGame={startGame} />}
      {gameStage === 'game' && (
        <Game 
          verifyLetter={verifyLetter} 
          pickedWord={pickedWord} 
          pickedCategory={pickedCategory} 
          letters={letters} 
          guessedLetters={guessedLetters}
          wrongLetters={wrongLetters}
          guesses={guesses}
          score={score}
        />
      )}
      {gameStage === 'end' && <GameOver retry={retry} score={score} />}
    </div>
  )

}

export default App
