import React, {useEffect, useRef, useState} from 'react';
import './App.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowDown, faArrowLeft, faArrowRight, faArrowUp} from "@fortawesome/free-solid-svg-icons";
import Flower from "./musics/Flower.mp3";
import ThichHayLaYeu from "./musics/Thich Hay La Yeu.mp3";
import ViAnhDauCoBiet from "./musics/Vi Anh Dau Co Biet.mp3";

const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
const MAX_LEVELS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
const MUSICS = [
	{
		name: "Flower",
		src: Flower
	},
	{
		name: "Thích Hay Là Yêu",
		src: ThichHayLaYeu
	},
	{
		name: "Vì Anh Đâu Có Biết",
		src: ViAnhDauCoBiet
	}
]
const Arrow = ({number, active, arrow, onClick}) => {
	return (
		<div className={`arrow ${active ? 'active' : ''}`} onClick={() => onClick(number)}>
			{arrow === 'ArrowUp' && <FontAwesomeIcon icon={faArrowUp} color={'#FFFFFF'} size={'2x'}/>}
			{arrow === 'ArrowDown' && <FontAwesomeIcon icon={faArrowDown} color={'#FFFFFF'} size={'2x'}/>}
			{arrow === 'ArrowLeft' && <FontAwesomeIcon icon={faArrowLeft} color={'#FFFFFF'} size={'2x'}/>}
			{arrow === 'ArrowRight' && <FontAwesomeIcon icon={faArrowRight} color={'#FFFFFF'} size={'2x'}/>}
		</div>
	);
};

export function App() {
	const [maxLevel, setMaxLevel] = useState(10)
	const [arrows, setArrows] = useState([]);
	const [numberArrow, setNumberArrow] = useState(1);
	const [pressSpace, setPressSpace] = useState(false);
	const [hack, setHack] = useState(false);
	const [activeArrow, setActiveArrow] = useState(null);
	const [music, setMusic] = useState(MUSICS[0].src);
	
	const audioRef = useRef(null);
	useEffect(() => {
		const handleClick = () => {
			console.log('loaded')
			audioRef.current.play().catch((error) => {
				// Autoplay may be blocked, handle the error or provide a play button.
				console.log('Auto-play failed:', error);
			});
		};
		
		// Attach the click event listener to the document body
		document.body.addEventListener('click', handleClick);
		
		return () => {
			// Remove the click event listener when the component unmounts
			document.body.removeEventListener('click', handleClick);
		};
	}, []);
	useEffect(() => {
		if (arrows.length > maxLevel) generateArrows()
	}, [maxLevel])
	const generateArrows = () => {
		const randomArrows = Array.from({length: numberArrow <= maxLevel ? numberArrow : 1 }, (_, index) => ({
			number: index + 1,
			arrow: ARROW_KEYS[Math.floor(Math.random() * ARROW_KEYS.length)],
			active: false,
		}));
		setNumberArrow(randomArrows.length + 1 > maxLevel ? 1 : randomArrows.length + 1)
		setArrows(randomArrows);
	}
	useEffect(() => {
		generateArrows();
	}, []);
	useEffect(() => {
		if (checkIfAllActive()) {
			setPressSpace(true)
		} else {
			setPressSpace(false)
		}
		const triggerKeyPress = (key) => {
			document.dispatchEvent(new KeyboardEvent('keydown', { key }));
		};
		const interval = setInterval(() => {
			if (hack && arrows.length) triggerKeyPress(arrows[getLastActiveIndex(arrows) + 1]?.arrow);
		}, 0);
		return () => clearInterval(interval);
	}, [arrows, hack])
	const checkIfArrowExists = (arrows, arrowPress) => {
		return arrows.length && arrows.some((arrow) => arrow.arrow === arrowPress)
	};
	const checkArrowPressed = (arrows, arrow, index) => {
		return arrows.length && arrows[index]?.arrow === arrow;
	};
	const checkIfAllActive = () => {
		return arrows.length && arrows.every((arrow) => arrow.active === true);
	};
	const getLastActiveIndex = (arrows) => {
		return arrows.map((arrow) => arrow.active).lastIndexOf(true);
	};
	const updateArrowActive = (arrows, index) => {
		const updatedArrows = arrows.map((arrow, i) =>
			index === i ? {...arrow, active: true} : arrow
		);
		setArrows(updatedArrows);
	};
	
	const disableAllArrows = () => {
		setArrows(arrows.map((arrow) => ({...arrow, active: false})))
	}
	const handleArrowClick = (number) => {
		if (number === activeArrow) {
			// Correct arrow, deactivate and move to the next one
			const nextArrowIndex = arrows.findIndex((arrow) => arrow.number === number) + 1;
			setActiveArrow(nextArrowIndex < arrows.length ? arrows[nextArrowIndex].number : null);
			
			// Deactivate the current arrow
			const updatedArrows = arrows.map((arrow) =>
				arrow.number === number ? {...arrow, active: false} : arrow
			);
			setArrows(updatedArrows);
		} else {
			// Incorrect arrow, reset the active arrow
			setActiveArrow(null);
			
			// Reset all arrows to inactive state
			const resetArrows = arrows.map((arrow) => ({...arrow, active: false}));
			setArrows(resetArrows);
		}
	};
	
	const handleKeyDown = (event) => {
		const keyPressed = event.key;
		if (event.code === 'KeyH') {
			setHack(!hack)
		}
		if (pressSpace === false) {
			if (checkIfArrowExists(arrows, keyPressed)) {
				const arrowNext = getLastActiveIndex(arrows) + 1;
				if (checkArrowPressed(arrows, keyPressed, arrowNext)) {
					updateArrowActive(arrows, arrowNext)
				} else {
					disableAllArrows(arrows)
				}
			} else {
				disableAllArrows(arrows)
			}
		} else if (pressSpace === true && event.code === 'Space') {
			generateArrows()
			setPressSpace(false)
		}
	};
	
	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [arrows, pressSpace]);
	return (
		<div className="App">
			<audio ref={audioRef}>
				<source src={MUSICS[Math.floor(Math.random() * MUSICS.length)].src} type="audio/mpeg" />
			</audio>
			<div className={'select-level'}>
				Max-Level
				<select onChange={(e) => {setMaxLevel(parseInt(e.target.value))}}>
					{MAX_LEVELS.map((level, index) => <option key={index} value={level}>{level}</option>)}
				</select>
			</div>
			{/*<div className={'select-music'}>*/}
			{/*	Select Music*/}
			{/*	<select onChange={(e) => {handlePlayClick(e.target.value)}}>*/}
			{/*		{MUSICS.map((music, index) => <option key={index} value={music.src}>{music.name}</option>)}*/}
			{/*	</select>*/}
			{/*</div>*/}
			<h1>Level {arrows.length}</h1>
			<div className="arrow-container">
				{arrows.map((arrow) => (
					<Arrow
						key={arrow.number}
						number={arrow.number}
						active={arrow.active}
						arrow={arrow.arrow}
						onClick={handleArrowClick}
					/>
				))}
				{/*{pressSpace === true && <h3>Press "Space"</h3>}*/}
			</div>
		</div>
	);
}

export default App;
