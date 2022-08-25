// import fetch from 'node-fetch'; al probar en navegador no se usa el import
const API = 'https://pokeapi.co/api/v2';
const FIND_POKEMON_BUTTON = document.querySelector('.find-pokemon-button');
const BEFORE_IMG_BUTTON = document.querySelector('.before-img-button');
const NEXT_IMG_BUTTON = document.querySelector('.next-img-button');
const ERROR_TEXT = document.querySelector('.error-text');

// Pokemon details
const POKEMON_IMG = document.querySelector('.pokemon-img');
const POKEMON_NUM = document.querySelector('.pokemon-num-field');
const POKEMON_NAME = document.querySelector('.pokemon-name-field');
const POKEMON_TYPES = document.querySelector('.pokemon-types-field');
const POKEMON_HEIGHT = document.querySelector('.pokemon-height-field');
const POKEMON_WEIGHT = document.querySelector('.pokemon-weight-field');
const POKEMON_SKILLS = document.querySelector('.pokemon-skills-field');
const POKEMON_LOCATIONS = document.querySelector('.pokemon-locations-field');
const POKEMON_EVOLUTION_CHAIN = document.querySelector(
	'.pokemon-evolution-chain-field'
);

/* 
	Variable que almacenara la lista de imagenes que contenga el pokemon
*/

let image_list = [];

FIND_POKEMON_BUTTON.addEventListener('click', async (event) => {
	ERROR_TEXT.classList.add('inactive');

	let pokedex_index = Math.ceil(Math.random() * 905);
	try {
		const pokemon = await fetchData(`${API}/pokemon/${pokedex_index}`);
		const pokemon_location = await fetchData(
			pokemon.location_area_encounters
		);

		// Se setea la imagen del pokemon
		setPokemonImageList(pokemon.sprites);
		setPokemonImage(image_list[0], pokemon.name);

		// Se setean los detalles del pokemons
		setNumberDetail(pokemon.id);
		setNameDetail(pokemon.name);
		setTypesDetail(pokemon.types);
		setHeightDetail(pokemon.height);
		setWeightDetail(pokemon.weight);
		console.log(pokemon_location);
	} catch (error) {
		ERROR_TEXT.classList.remove('inactive');
	}
});

// Seteo de lista de imagenes y seteo de imagen, junto con event listener de los botones de navegacion

BEFORE_IMG_BUTTON.addEventListener('click', () => {
	const img_index = image_list.indexOf(POKEMON_IMG.getAttribute('src'));
	if (img_index > 0) {
		setPokemonImage(image_list[img_index - 1]);
	}
});

NEXT_IMG_BUTTON.addEventListener('click', () => {
	const img_index = image_list.indexOf(POKEMON_IMG.getAttribute('src'));
	if (img_index < image_list.length - 1) {
		setPokemonImage(image_list[img_index + 1]);
	}
});

function setPokemonImageList(pokemon_sprites) {
	image_list = Object.values(pokemon_sprites);
	image_list.pop();
	image_list = getArrayFromObjectArray(image_list);
	image_list.reverse();
	/* 
		image_list.pop() eliminara las distintas imagenes de cada generacion de pokemon.
		El motivo de esta modificacion es que al incluir dichas imagenes se presentaran
		algunos pokemon que tendran unas 70 imagenes, haciendo tedioso el moverse entre
		las mismas de manera adecuada.
	*/
}

function setPokemonImage(img, name) {
	if (img == null) {
		img = 'https://cdn-icons-png.flaticon.com/512/3875/3875172.png';
	}
	POKEMON_IMG.setAttribute('class', 'pokemon-img');
	POKEMON_IMG.setAttribute('src', img);
	POKEMON_IMG.setAttribute('alt', `${name} image`);
	BEFORE_IMG_BUTTON.classList.remove('inactive');
	NEXT_IMG_BUTTON.classList.remove('inactive');
}

// Seteo de detalles del pokemon

function setNumberDetail(pokedex_number) {
	POKEMON_NUM.innerText = `Pokedex Number: ${pokedex_number}`;
}

function setNameDetail(name) {
	POKEMON_NAME.innerText = `Name: ${name}`;
}

function setTypesDetail(types) {
	const types_string = 'Not Implemented';
	POKEMON_TYPES.innerText = `Types: ${types_string}`;
}

function setHeightDetail(height) {
	POKEMON_HEIGHT.innerText = `Height (meters): ${height / 10}`;
}

function setWeightDetail(weight) {
	POKEMON_WEIGHT.innerText = `Weight (Kilograms): ${weight / 10}`;
}

// Funcion Async para utilizar fetch

async function fetchData(urlApi) {
	const response = fetch(urlApi);
	const data = (await response).json();
	return data;
}

// Funciones Auxiliares
function getArrayFromObjectArray(objArr) {
	let arr = Object.values(objArr);
	let length = arr.length;

	for (let i = 0; i < length; i++) {
		if (arr[i] instanceof Object) {
			arr = arr.concat(Object.values(arr[i]));
			arr.splice(i, 1);
			i--;
			length = arr.length;
		} else if (arr[i] == null) {
			arr.splice(i, 1);
			i--;
			length = arr.length;
		}
	}
	return arr;

	/*
		El objetivo de esta funcion es transformar un array que contiene objetos en un solo
		array que contenga los valores de los atributos de sus objetos
		Las lineas que indican "i--" se utilizan para que, luego de la eliminacion del elemento
		del arreglo con el metodo splice, vuelva a analizarse dicha posicion del arreglo.
		las modificaciones de la variable lenght sirven para que el bucle for no finalice hasta
		que no existan mas Objetos dentro del arreglo

		Puede probarse realizar de forma recursiva o mediante la funcion Map
	*/
}
