/////////////////////////////////////////////////////// AFFICHAGE

const htmlResult = document.getElementById("result");

class HtmlGenerator {

    constructor(arg) {
        this.arg = arg
    }

    htmlH3() {
        let h3 = document.createElement("h3");
        h3.innerHTML = this.arg;
        return h3;
    }
    htmlH4() {
        let h4 = document.createElement("h4");
        h4.innerHTML = this.arg;
        return h4;
    }
    htmlH5() {
        let h5 = document.createElement("h5");
        h5.innerHTML = this.arg;
        return h5;
    }
    htmlP() {
        let p = document.createElement("p");
        p.innerHTML = this.arg;
        return p;
    }
}

function Recipe(id, image, name, servings, ingredients, time, description, appliance, ustensils) {
    this.id = id;
    this.image = image;
    this.name = name;
    this.servings = servings;
    this.ingredients = ingredients;
    this.time = time;
    this.description = description;
    this.appliances = appliance;
    this.ustensils = ustensils;

    this.getHTMLCode = () => {
        let htmlArticle = document.createElement("article"),
            html_Image = document.createElement("img"),
            htmlDiv = document.createElement("div");

        let html_title = new HtmlGenerator(this.name).htmlH3(),
            html_recette_title = new HtmlGenerator("recette").htmlH4(),
            html_recette_p = new HtmlGenerator(this.description).htmlP(),
            html_ingredients_title = new HtmlGenerator("ingredients").htmlH4();

        let ingredient_list = [],
            ingredient_quantity_list = [];
        ingredient_quantity_raw = [];

        this.ingredients.forEach(function (e) {
            let html_ingredients_title = new HtmlGenerator(e.ingredient).htmlH4(),
                html_ingredients_quantity = new HtmlGenerator(e.quantity).htmlH4();

            ingredient_list.push(html_ingredients_title);
            ingredient_quantity_raw.push(e.quantity)
            ingredient_quantity_list.push(html_ingredients_quantity);
        });

        let index = -1;
        ingredient_list.forEach(function (e) {
            index++,
            quantity_number = {};
            quantity_number = ingredient_quantity_list[index];

            htmlDiv.appendChild(e);
            if (quantity_number.textContent !== "undefined") {
                htmlDiv.appendChild(quantity_number);
            }
        });

        html_Image.src = "assets/photos/" + this.image

        htmlArticle.append(html_Image, html_title, html_recette_title,
            html_recette_p, html_ingredients_title, htmlDiv);

        return htmlArticle;
    }
}

recipes.forEach(function (arg) {
    let recipe = new Recipe(
        arg.id,
        arg.image,
        arg.name,
        arg.servings,
        arg.ingredients,
        arg.time,
        arg.description,
        arg.appliances,
        arg.ustensils
    );
    htmlResult.appendChild(recipe.getHTMLCode());
})



/////////////////////////////////////////////////////// ALGORITHME


// Search index for recipes
function createSearchIndex(recipes) {
    const index = {};
    recipes.forEach(recipe => {
        const words = getWordsFromRecipe(recipe);
        words.forEach(word => {
            if (!index[word]) {
                index[word] = new Set();
            }
            index[word].add(recipe.id);
        });
    });
    return index;
}
const index = createSearchIndex(recipes);

function getWordsFromRecipe(recipe) {
    const words = new Set();
    const fieldsToIndex = [recipe.name, recipe.description, ...recipe.ingredients.map(i => i.ingredient)];
    fieldsToIndex.forEach(field => {
        field.toLowerCase().split(/\s+/).forEach(word => {
            words.add(word);
        });
    });
    return words;
}


// Search function
function search(query, index, recipes) {
    if (query.length < 3) return [];

    const queryLower = query.toLowerCase();
    const resultSet = new Set();

    Object.keys(index).forEach(word => {
        if (word.startsWith(queryLower)) {
            index[word].forEach(id => resultSet.add(id));
        }
    });

    return Array.from(resultSet).map(id => recipes.find(recipe => recipe.id === id));
}

// Search event
document.getElementById('search').addEventListener('input', (e) => {
    const searchResults = search(e.target.value, index, recipes);
    const selectedOptions = getSelectedDropdownOptions();
    const filteredResults = filterResults(searchResults, selectedOptions);
    updateUIWithResults(filteredResults);
});

// Search display
function updateUIWithResults(results) {
    htmlResult.innerHTML = '';
    results.forEach(recipeData => {
        let recipe = new Recipe(
            recipeData.id,
            recipeData.image,
            recipeData.name,
            recipeData.servings,
            recipeData.ingredients,
            recipeData.time,
            recipeData.description,
            recipeData.appliances,
            recipeData.ustensils
        );
        htmlResult.appendChild(recipe.getHTMLCode());
    });
}

// Fonction pour obtenir les options sélectionnées dans les dropdowns
function getSelectedDropdownOptions() {
    const selectedOptions = {
        ingredients: new Set(),
        devices: new Set(),
        tools: new Set(),
    };

    document.querySelectorAll('.dropdown-content').forEach(dropdown => {
        const category = dropdown.parentElement.id.split('dropdown')[1].toLowerCase();
        dropdown.querySelectorAll('.dropdown-option').forEach(option => {
            if (option.getElementsByTagName("input")[0].checked) {
                console.log(selectedOptions[category])
                selectedOptions[category].add(option.getElementsByTagName("span")[0].textContent.toLowerCase()); 
            }
        });
    });

    return selectedOptions
}

// Fonction pour filtrer les résultats en fonction des options sélectionnées et de la recherche
function filterResults(results, selectedOptions, searchQuery) {
    return results.filter(recipeData => {
        const hasSelectedIngredients = selectedOptions.ingredients.size === 0 ||
            recipeData.ingredients.some(ingredient => selectedOptions.ingredients.has(ingredient.ingredient.toLowerCase()));

        const hasSelectedAppliance = selectedOptions.devices.size === 0 ||
            selectedOptions.devices.has(recipeData.appliance.toLowerCase());

        const hasSelectedUstensils = selectedOptions.tools.size === 0 ||
            recipeData.ustensils.some(ustensil => selectedOptions.tools.has(ustensil.toLowerCase()));

        const searchQueryDefined = searchQuery || ''; // Défaut à une chaîne vide si searchQuery est indéfini
        const matchesSearchQuery = searchQueryDefined.length === 0 ||
            recipeData.name.toLowerCase().includes(searchQueryDefined.toLowerCase()) ||
            recipeData.description.toLowerCase().includes(searchQueryDefined.toLowerCase());

        return hasSelectedIngredients && hasSelectedAppliance && hasSelectedUstensils && matchesSearchQuery;
    });
}



/////////////////////////////////////////////////////// FILTERS

// création des listes
function createDropdownLists(recipes) {
    const ingredients = new Set();
    const appliances = new Set();
    const ustensils = new Set();

    recipes.forEach(recipe => {
        recipe.ingredients.forEach(ingredient => {
            ingredients.add(ingredient.ingredient);
        });
        appliances.add(recipe.appliance);
        recipe.ustensils.forEach(ustensil => {
            ustensils.add(ustensil);
        });
    });

    return {
        ingredients,
        appliances,
        ustensils
    };
}

// gestion du dropdown custom
const dropdownData = createDropdownLists(recipes);
document.querySelectorAll('.dropdown-header').forEach(header => {
    header.addEventListener('click', function() {
        // Fermer tous les dropdowns
        document.querySelectorAll('.dropdown-content').forEach(dropdown => {
            dropdown.style.display = "none";
        });

        // Ouvrir le dropdown actuel
        const dropdownContent = this.nextElementSibling;
        dropdownContent.style.display = 'block';
    });
});


// initialiser les dropdowns
function populateDropdown(dropdownId, items) {
    const dropdownContent = document.querySelector(`#${dropdownId} .dropdown-content`);
    // Supprimer les options existantes
    const existingOptions = dropdownContent.querySelectorAll('.dropdown-option');
    existingOptions.forEach(option => option.remove());

    // Ajouter les nouvelles options
    items.forEach(item => {
        const label = document.createElement('label');
        label.classList.add('dropdown-option');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = item;

        const span = document.createElement('span');
        span.textContent = item;

        label.appendChild(checkbox);
        label.appendChild(span);
        dropdownContent.appendChild(label);
    });
}

// Initialiser les dropdowns avec les données
populateDropdown('dropdownIngredients', dropdownData.ingredients);
populateDropdown('dropdownDevices', dropdownData.appliances);
populateDropdown('dropdownTools', dropdownData.ustensils);

document.querySelectorAll('.dropdown-search').forEach(input => {
    const dropdownContent = input.parentElement;
    // Filtrer les options lors de la saisie
    input.addEventListener('input', function () {
        const filter = this.value.toLowerCase();
        const options = dropdownContent.querySelectorAll('.dropdown-option');

        options.forEach(option => {
            const txtValue = option.textContent || option.innerText;
            option.style.display = txtValue.toLowerCase().includes(filter) ? "" : "none";
        });
    });
});

const selections = {
    ingredients: new Set(),
    devices: new Set(),
    tools: new Set()
};

document.querySelectorAll('.dropdown-content').forEach(dropdown => {
    dropdown.addEventListener('change', function (event) {
        if (event.target.type === 'checkbox') {
            const selectedOptions = getSelectedDropdownOptions();
            const searchValue = document.getElementById('search').value.toLowerCase();
            const searchResults = search(searchValue, index, recipes);
            console.log(searchValue);
            const filteredResults = filterResults(searchResults, selectedOptions);
            updateUIWithResults(filteredResults);
        }
    });
});

// Fermer dropdown
window.onclick = function (event) {
    // Si le clic n'est pas sur un dropdown-search et pas sur un dropdown-header
    if (!event.target.matches('.dropdown-search') && !event.target.matches('.dropdown-header')) {
        document.querySelectorAll('.dropdown-content').forEach(dropdown => {
            dropdown.style.display = "none";
        });
    }
};
