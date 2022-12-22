import { PixabayApi } from "./fetchImages";
import markupGallery from "../templates/markupGallery.hbs";
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('#search-form');
const input = document.querySelector('.search-form-input');
const searchBtn = document.querySelector('.search-form-button');
const gallery = document.querySelector('.gallery');
const btnLoadMore = document.querySelector('.load-more');

let simpleLightbox = new SimpleLightbox('.gallery a');

const pixabayApi = new PixabayApi()

searchForm.addEventListener('submit', onSearchFormSubmit);
btnLoadMore.addEventListener('click', onLoadMoreSubmit)

async function onSearchFormSubmit(event) {
  event.preventDefault();
  pixabayApi.page = 1;
  pixabayApi.searchQuery = event.target.elements.searchQuery.value.trim();


  try{    
    const searchResult = await pixabayApi.fetchImages()
    const imagesArr = searchResult.data.hits;    

    if (!pixabayApi.searchQuery) {
      gallery.innerHTML = '';
      btnLoadMore.classList.add('is-hidden');
      
    Notiflix.Notify.failure('Enter the keyword, please');
    return;
  }
    
    if (imagesArr.length === 0) {
      gallery.innerHTML = '';
      btnLoadMore.classList.add('is-hidden');

      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.')
      throw new Error("Limit error");
    }

    if (imagesArr.length < pixabayApi.per_page) {
      gallery.innerHTML = markupGallery(imagesArr);
      btnLoadMore.classList.add('is-hidden');
      simpleLightbox.refresh();

      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
        return;
    }

    gallery.innerHTML = markupGallery(imagesArr);
    btnLoadMore.classList.remove('is-hidden');
    simpleLightbox.refresh();

    Notiflix.Notify.info(`Hooray! We found ${searchResult.data.totalHits} images.`)
  } catch (err) { console.log(err);}

}

async function onLoadMoreSubmit () {
  pixabayApi.page += 1;
  
    try {
      const searchResult = await pixabayApi.fetchImages()
      const imagesArr = searchResult.data.hits;         
      gallery.insertAdjacentHTML('beforeend', markupGallery(imagesArr));
      simpleLightbox.refresh();
      slowScroll();

      if (imagesArr.length === pixabayApi.page) {
        btnLoadMore.classList.add('is-hidden');
      }

      if(Math.ceil(searchResult.data.totalHits / pixabayApi.per_page) === pixabayApi.page) {
        btnLoadMore.classList.add('is-hidden');
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
        return;
      }
    } catch (err) { console.log(err); }
}

function slowScroll () {
  const { height: cardHeight } = document
  .querySelector(".gallery")
  .firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: "smooth",
  });
}