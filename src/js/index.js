import Search from './models/Search'
import Recipe from './models/Recipe'
import List from './models/List'
import Likes from './models/Likes'
import * as searchView from "./views/searchView"
import * as recipeView from "./views/recipeView"
import * as listView from "./views/listView"
import * as likesView from "./views/likesView"
import { elements, renderLoader, clearLoader } from "./views/base"


const state={}

const controlSearch = async ()=>{

    const query= searchView.getInput()
    
   if (query) { 
     
    state.search = new Search(query);

    searchView.clearInput()
    searchView.clearResults()
    renderLoader(elements.searchRes)
    
    try {
      
      await state.search.getResults();
 
      clearLoader()
     searchView.renderResults(state.search.result)
      
    } catch (error) {
      alert(error)
      clearLoader()
    }

  }
  }

elements.searchForm.addEventListener("submit", (e) => {
    e.preventDefault()
    controlSearch()
}); 


elements.searchResPages.addEventListener('click',e=>{
    const btn= e.target.closest('.btn-inline')
    if (btn) {
      const goToPage= parseInt(btn.dataset.goto,10)
      searchView.clearResults()
      searchView.renderResults(state.search.result,goToPage)
    }
})


const controlRecipe= async ()=>{
    

 const id= window.location.hash.replace("#","")

 if (id) {
  
  recipeView.clearRecipe()
  renderLoader(elements.recipe)

  if (state.search)  searchView.highlightSelected(id)
    

   state.recipe = new Recipe(id)

   try {
     await state.recipe.getRecipe()
     state.recipe.parseIngredients()
    

     state.recipe.calcTime()
     state.recipe.calcServings()
     
     clearLoader()
     recipeView.renderRecipe(
       state.recipe,
       state.likes.isLiked(id)
       )
     
   } catch (error) {
      alert(error)
   }
 }
}

// window.addEventListener("hashchange",controlRecipe)
// window.addEventListener("load",controlRecipe)
["hashchange","load"].forEach(event=> window.addEventListener(event,controlRecipe))



/* LIST CONTROLLER */
const controlList = () => {
    // Create a new list IF there in none yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}


/* LIKE CONTROLLER */
 const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // User has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to UI list
        likesView.renderLike(newLike);
        console.log(state.likes);

    // User HAS liked current recipe
    } else {
        // Remove like from the state
        state.likes.deleteLike(currentID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like from UI list
        likesView.deleteLike(currentID);
        console.log(state.likes);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);

    // Handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    
    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }
});