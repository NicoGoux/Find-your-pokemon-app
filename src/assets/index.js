// import fetch from 'node-fetch'; al probar en navegador no se usa el import
const API = 'https://pokeapi.co/api/v2';
const FIND_POKEMON_INPUT = document.querySelector('.find-pokemon-input');
const FIND_POKEMON_BUTTON = document.querySelector('.find-pokemon-button');
const BEFORE_IMG_BUTTON = document.querySelector('.before-img-button');
const NEXT_IMG_BUTTON = document.querySelector('.next-img-button');
const ERROR_TEXT = document.querySelector('.error-text');
const RECENT_SEARCH = document.querySelector('.last-pokemons-dropdown');
const DROPDOWN_LIST = document.querySelector('.dropdown-list');
const BURGUER_MENU = document.querySelector('.burguer-menu');
const NAVBAR = document.querySelector('.header-nav');

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

FIND_POKEMON_INPUT.addEventListener('keypress', (event) => {
	if (event.key === 'Enter') {
		FIND_POKEMON_BUTTON.click();
	}
});

FIND_POKEMON_BUTTON.addEventListener('click', async (event) => {
	ERROR_TEXT.innerText = '';

	//Se toma el valor del campo output y, en caso de ser vacio, se obtendra un pokemon aleatorio
	const search_index = FIND_POKEMON_INPUT.value
		? FIND_POKEMON_INPUT.value.toLowerCase().trim().replaceAll(' ', '-')
		: Math.ceil(Math.random() * 905);

	try {
		//Se obtiene el pokemon
		const pokemon = await fetchData(`${API}/pokemon/${search_index}`);

		//Se obtiene las posibles ubicaciones del pokemon
		const pokemon_locations = await fetchData(
			pokemon.location_area_encounters
		);

		//Se obtiene la cadena de evolucion del pokemon
		const pokemon_species = await fetchData(pokemon.species.url);
		const pokemon_evolution_chain = await fetchData(
			pokemon_species.evolution_chain.url
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
		setSkillsDetail(pokemon.abilities);
		setLocationsDetail(pokemon_locations);
		setEvolutionChainDetail(pokemon_evolution_chain);

		// Se guarda en cookie la ultima busqueda
		saveLastFiveSearch(pokemon.name);
		FIND_POKEMON_INPUT.value = '';
	} catch (error) {
		if (error.name == 'TypeError') {
			ERROR_TEXT.innerText = 'Could not get access to PokeAPI';
		} else if (error.name == 'SyntaxError') {
			ERROR_TEXT.innerText = 'pokemon not found';
		}
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
	if (pokedex_number) {
		POKEMON_NUM.innerText = `Pokedex Number: ${pokedex_number}`;
	} else {
		POKEMON_NUM.innerText = 'Pokedex Number: not specified';
	}
}

function setNameDetail(name) {
	if (name) {
		POKEMON_NAME.innerText = `Name: ${name.replaceAll('-', ' ')}`;
	} else {
		POKEMON_NAME.innerText = `Name: not specified`;
	}
}

function setTypesDetail(types) {
	if (types.length) {
		const types_string_array = types.map((value) => value.type.name);
		const types_string = types_string_array
			.toString()
			.replaceAll(',', ', ');
		POKEMON_TYPES.innerText = `Types: ${types_string}`;
	} else {
		POKEMON_TYPES.innerText = `Types: not specified`;
	}
}

function setHeightDetail(height) {
	if (height) {
		POKEMON_HEIGHT.innerText = `Height (meters): ${height / 10}`;
	} else {
		POKEMON_HEIGHT.innerText = `Height (meters): not specified`;
	}
}

function setWeightDetail(weight) {
	if (weight) {
		POKEMON_WEIGHT.innerText = `Weight (Kilograms): ${weight / 10}`;
	} else {
		POKEMON_WEIGHT.innerText = `Weight (Kilograms): not specified`;
	}
}

function setSkillsDetail(skills) {
	if (skills.length) {
		const skills_string_array = skills.map((value) => value.ability.name);
		const skills_string = skills_string_array
			.toString()
			.replaceAll(',', ', ')
			.replaceAll('-', ' ');
		POKEMON_SKILLS.innerText = `Types: ${skills_string}`;
	} else {
		POKEMON_SKILLS.innerText = `Types: not specified`;
	}
}

function setLocationsDetail(locations) {
	if (locations.length) {
		const locations_string_array = locations.map(
			(value) =>
				value.location_area.name
					.replaceAll(/\d+f?-?/gi, '')
					.replaceAll(/-+/g, ' ')
					.trim()
			/*	
				EL manejo de string se realiza para disminuir la cantidad de zonas mostradas,
				dejando solamente indicada la zona principal a la que se hace referencia en
				cada elemento
					El primero replaceAll elimina los numeros de pisos/areas
					El segundo replaceAll elimina los guiones y los reemplaza por espacios
					trim eliminara los espacios en blanco iniciales y finales
			*/
		);

		const locations_string = Array.from(
			new Set(locations_string_array)
			//Se genera un set para eliminar los elementos repetidos y luego se transforma a arreglo
		).join(', ');

		POKEMON_LOCATIONS.innerText = `Locations: ${locations_string}`;
	} else {
		POKEMON_LOCATIONS.innerText = `Locations: not specified`;
	}
}

function setEvolutionChainDetail(evolution_chain) {
	// Pokemon inicial de la cadena
	const init_chain_pokemon = evolution_chain.chain;

	let evolution_chain_string = recursivePokemonChain(init_chain_pokemon)
		.replaceAll(/-+/g, ' ')
		.trim();
	POKEMON_EVOLUTION_CHAIN.innerHTML = `Evolution chain: ${evolution_chain_string}`;
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

function recursivePokemonChain(init_pokemon, evolution_chain_string = '') {
	evolution_chain_string += init_pokemon.species.name;
	if (init_pokemon.evolves_to.length === 0) {
		return evolution_chain_string;
	} else if (init_pokemon.evolves_to.length === 1) {
		return recursivePokemonChain(
			init_pokemon.evolves_to[0],
			evolution_chain_string + ' &#8594 '
		);
	} else {
		/*	
			En este caso se recorre la cadena de evolucion y se obtiene un mensaje por cada una de estas.
			Luego el mensaje se concatena al mensaje final (evolution_chain_string) y se devuelve.
		*/
		evolution_chain_string = '';
		for (const evolution of init_pokemon.evolves_to) {
			let individual_chain_evolution_string = init_pokemon.species.name;
			individual_chain_evolution_string = recursivePokemonChain(
				evolution,
				individual_chain_evolution_string + ' &#8594 '
			);
			evolution_chain_string += individual_chain_evolution_string + ', ';
		}
		//Se hace un slice para eliminar los dos ultimos caracteres ', ' agregados
		return evolution_chain_string.slice(0, -2);
	}

	/* 
		Este metodo recursivo se encarga de retornar en orden las lineas de evolucion
		de los pokemon. En caso de presentarse un error puede deberse a que el "else"
		solo servira en casos especificos como el de eevee y, al no conocer pokemones
		que posean una cadena de evolucion mas larga, no pudo ser probado correctamente.
		Este fallo podria darse en un caso muy especifico del cual desconozco su posibilidad
		Supongamos un pokemon el cual puede evolucionar en 3 pokemones distintos y a su vez
		estos 3 pueden evolucionar en 3 mas, en dicho caso la muestra en pantalla sera
		inentendible
	*/
}

// Manejo de busquedas recientes
RECENT_SEARCH.addEventListener('click', (event) => {
	DROPDOWN_LIST.classList.toggle('inactive');

	if (document.cookie) {
		// Se eliminan todos los elementos li dentro del elemento ul
		while (DROPDOWN_LIST.firstChild) {
			DROPDOWN_LIST.removeChild(DROPDOWN_LIST.firstChild);
		}

		// Se genera un array que contiene el nombre de los ultimos pokemon buscados
		const recent_search_pokemon = document.cookie
			.replace(/[a-z,_]*=/i, '')
			.split(',');

		// Se recorre el array de nombres y se crea un elemento li por cada uno de los nombres.
		for (const recent_pokemon_name of recent_search_pokemon) {
			let dropdown_item = document.createElement('li');
			dropdown_item.setAttribute('class', 'last-search-item');
			dropdown_item.innerText = recent_pokemon_name
				.replaceAll('-', ' ')
				.trim();
			// Se agrega un eventListener a cada elemento li antes de agregarlo al elemento ul
			addClickEventListener(dropdown_item);
			DROPDOWN_LIST.appendChild(dropdown_item);
		}
	}
});

DROPDOWN_LIST.addEventListener('mouseleave', (event) => {
	DROPDOWN_LIST.classList.add('inactive');
});

function addClickEventListener(dropdown_item) {
	dropdown_item.addEventListener('click', (event) => {
		// Se setea el valor del elemento li al input y realiza una pulsacion del boton find_pokemon
		FIND_POKEMON_INPUT.value = dropdown_item.innerText;
		FIND_POKEMON_BUTTON.click();
	});
}

function saveLastFiveSearch(pokemon_data) {
	// Se declara un arreglo donde cada elemento sera un nombre de pokemon
	let cookie_array = document.cookie.replace(/[a-z,_]*=/i, '').split(',');

	//
	if (cookie_array[0] != pokemon_data) {
		if (cookie_array.find((name) => name === pokemon_data)) {
			removeRepeatedSearch(pokemon_data);

			// Se re-inicializa el arreglo para que no tenga en cuenta el ultimo elemento
			cookie_array = document.cookie.replace(/[a-z,_]*=/i, '').split(',');
		}

		// Se almacenaran solo los ultimos 5 nombres buscados
		if (cookie_array.length >= 5) {
			removeOldestSearch();
			addRecentSearch(pokemon_data);
			return;
		} else if (document.cookie) {
			addRecentSearch(pokemon_data);
		} else {
			createCookie('recent_search', pokemon_data);
		}
	}
}

function createCookie(cookie_name, value) {
	document.cookie = cookie_name + '=' + value + ';';
}

function addRecentSearch(value) {
	const actual_recent_search = document.cookie;
	document.cookie = actual_recent_search.replace('=', '=' + value + ',');
}

function removeOldestSearch() {
	// Se elimina el ultimo elemento (mas antiguo)
	const oldest_search_init = document.cookie.lastIndexOf(',');
	document.cookie = document.cookie.substring(0, oldest_search_init);
}

function removeRepeatedSearch(value) {
	// se elimina el elemento repetido para luego colocarlo nuevamente al principio
	document.cookie = document.cookie.replace(',' + value, '');
}

// Action listener menu hamburguesa para tamaños moviles
BURGUER_MENU.addEventListener('click', (event) => {
	NAVBAR.classList.toggle('nav-toggle');
});

NAVBAR.addEventListener('mouseleave', (event) => {
	NAVBAR.classList.toggle('nav-toggle');
});
