//variabili ---------------------------------------------------
const OPENAI = {
    API_BASE_URL: 'https://api.openai.com/v1',
    CHAT_ENDPOINT: '/chat/completions',
    IMAGE_ENDPOINT: '/images/generations',
    API_KEY: '', //<-- qui devi inserire la tua API key
};


const ingredients = document.querySelectorAll(".ingredient");
const bowlSlots = document.querySelectorAll(".bowl-slot");
const cookButton = document.querySelector("#cook-btn");
const loading = document.querySelector('.loading');
const modal = document.querySelector('.modal');
const recipeContent = document.querySelector('.modal-content');
const recipeImage = document.querySelector('.modal-image');
const modalClose = document.querySelector('.modal-close');

let bowl = [];

//main----------------------------------------------------------
ingredients.forEach(function (element) {
    element.addEventListener('click', function () {
        addIngredient(element.innerText);
    });
});

modalClose.addEventListener('click', function (){
    modal.classList.add('hidden');
})

cookButton.addEventListener('click', createRecipe);

//funzioni ---------------------------------------------------------
function addIngredient(ingredient) {
    if(bowl.length == bowlSlots.length){
        bowl.shift();
    }

    bowl.push(ingredient);

    bowlSlots.forEach(function (slot, index) {
        if(bowl[index]){
            slot.innerText = bowl[index];
        }
    });

    //qui dopo aver inserito gli ingredienti visualizzo il button
    if(bowl.length == bowlSlots.length){
        cookButton.classList.remove('hidden');
    }
}

async function createRecipe() {
    loading.classList.remove('hidden');

    const prompt = `\
    Crea una ricetta con questi ingredienti: ${bowl.join(', ')}.
    La ricetta deve essere facile e con un titolo creativo e divertente.
    Le tue risposte sono solo in formato JSON come questo esempio:
    
    ###
    
    {
        "titolo": "Titolo ricetta",
        "ingredienti": "1 uovo e 1 pomodoro",
        "istruzioni": "mescola gli ingredienti e metti in forno"
    }
    
    ###`;

    const recipeResponse = await makeRequest(OPENAI.CHAT_ENDPOINT, {
        model: 'gpt-3.5-turbo',
        messages: [{
            role: 'user',
            content: prompt
        }]
    });

    const recipe = JSON.parse(recipeResponse.choices[0].message.content);

    loading.classList.add('hidden');
    modal.classList.remove('hidden');

    recipeContent.innerHTML = `\
    <h2>${recipe.titolo}</h2>
    <p>${recipe.ingredienti}</p>
    <p>${recipe.istruzioni}</p>`;

    const imageResponse =  await makeRequest(OPENAI.IMAGE_ENDPOINT, {
        prompt: recipe.titolo,
        n: 1,
        size: '450x450'
    });

    const imageUrl = imageResponse.data[0].url;
    recipeImage.innerHTML = `<img src="${imageUrl}" alt="recipeImage" >`;
    clearBowl();
}

function clearBowl(){
    bowl = [];

    bowlSlots.forEach(function (slot){
        slot.innerText = '?';
    });


}

async function makeRequest(endpoint, payload) {
    const response = await fetch(OPENAI.API_BASE_URL + endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            //ricorda il backtick 
            'Authorization': `Bearer ${OPENAI.API_KEY}`
        },
        body: JSON.stringify(payload)
    });

    const json = response.json();
    return json;
}