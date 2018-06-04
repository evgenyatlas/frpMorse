import K from 'kefir'
import morseAlph from './morse.json'
import msSpan from './msSpan.json'

const DASH = '-'
const DOT = '.'

const keyUps = K.fromEvents(document, 'keyup')
const keyDowns = K.fromEvents(document, 'keydown')

const spaceKeyUps = keyUps.filter((data) => data.keyCode === 32)
const spaceKeyDowns = keyDowns.filter((data) => data.keyCode === 32)
const enterKeyDowns = keyDowns.filter((data) => data.keyCode === 13).map(_ => "enter")

const rawSignalStarts = spaceKeyDowns.map(_ => "start")
const rawSignalEnds = spaceKeyUps.map(_ => "end")

const signalStartsEnds = K.merge([rawSignalStarts, rawSignalEnds]).skipDuplicates()

const signalStarts = signalStartsEnds.filter((ev) => ev === "start").map(Date.now)
const signalEnds = signalStartsEnds.filter((ev) => ev === "end").map(Date.now)

const spanStream = signalStarts.flatMapLatest((start) => signalEnds.map((end) => end - start))

const dotsStream = spanStream.filter((v) => v <= msSpan.dotDash).map(_ => DOT)
const lineStream = spanStream.filter((v) => v > msSpan.dotDash).map(_ => DASH)

const dotsAndLines = K.merge([dotsStream, lineStream, enterKeyDowns])
const endResult = dotsAndLines.bufferWhile(data => data !== 'enter').map(data => data.filter(str => str !== 'enter').join('')).log()

endResult.observe(data => console.log(morseAlph[data]))