let pageSize = 9;
let currentPage = 1;
var baseUrl = "https://dent-revproxy.dent.cmu.ac.th/gallery/api/album";

//Search bar.
let data = [];
const searchInput = document.getElementById('search');
searchInput.addEventListener('keyup', (e)=> {
  const input = e.target.value;
  const filterAlbums = data.filter(album => {
    return (album.album_name.includes(input) || album.tags.includes(input));
  })
  console.log(filterAlbums);
  displayAlbum(filterAlbums);
})

//Fetch API for all albums.
async function getData() {
  const response = await fetch(baseUrl, { headers: {Authorization: 'Bearer $2y$10$nPrL3UoSMtorjhd0LykycODdkwY.JEbYUBfX5nAzB5vuMYbqJL2N6'}});
  data = await response.json();
  displayAlbum(data);
  console.log(data);
}

//Fetch API for an album by ID.
var arrayViewData = [];
async function getViewData(id) {
  const response = await fetch(baseUrl+"/"+id, { headers: {Authorization: 'Bearer $2y$10$nPrL3UoSMtorjhd0LykycODdkwY.JEbYUBfX5nAzB5vuMYbqJL2N6'}});
  const data = await response.json();
  arrayViewData = data.image;
  console.log(arrayViewData);
}

//Fetch API for all tags.
var arrayTagsData = [];
var sortedData = [];
async function getTagsData() {
  const response = await fetch(baseUrl, { headers: {Authorization: 'Bearer $2y$10$nPrL3UoSMtorjhd0LykycODdkwY.JEbYUBfX5nAzB5vuMYbqJL2N6'}});
  const data = await response.json();
  for(var i=0;i<data.length;i++) {
    arrayTagsData[i] = data[i].tags;
  }
  arrayTagsData = _.flatten(arrayTagsData);
  console.log(arrayTagsData);
  //Eliminate duplicates by using the removeDuplicate() function.
  sortedData = removeDuplicate(arrayTagsData, 'tags_name');
  console.log(sortedData);
}

//Display albums and pagination. (responsive)          
async function displayAlbum (datas, page = 1) { 
  var title = document.getElementById("image-title");
  title.innerHTML = "IMAGE COLLECTION";

  if(page == 1) {
    prevButton.className = 'previous-page-disabled';
  }
  else {
    prevButton.className = 'previous-page';
  }
  if(page == numberOfPages()) {
    nextButton.className = 'next-page-disabled';
  }
  else {
    nextButton.className = 'next-page';
  }
  const albumData = datas.filter((row, index) => {
    let start = (currentPage - 1) * pageSize;
    let end = currentPage * pageSize;

    if(index >= start && index < end) return true;
  }).map(album => {
    return `<div class="card">
    <div class="card-image" data-href="#" onClick="displayPictures(this.id)" id="${(album.albums_id)}" ><img class="pics" src="${(album.cover)}" alt="${(album.album_name)}"></div>
    <div class="card-info" id="card"><h5 class="album-title">${(album.album_name)}</h5></div></div>`;
  }).join('');
  document.getElementById("card-content").innerHTML= albumData;
  document.getElementById("back-button").style.display= "none";
  document.getElementById("pagination").style.display= "inline-block";
  //Change the album name corresponding to where the user clicked into.
  var cards = document.getElementsByClassName("pics");
  for(var i=0;i<cards.length;i++) {
    var titleCard = cards[i];
    titleCard.onclick = function() {
      title.innerHTML = this.alt;
    }
  }
}
getData();

//View pictures.
async function displayPictures(id) {
  await getViewData(id);
  var pictureData = "";

  arrayViewData.forEach(picture => {
    pictureData += `<div class="card-pictures">`
    pictureData += `<div class="view-pictures"><img class="pic" src="${(picture.images_name)}"></div></div>`
    pictureData += `<div class="modal" id="myModal"><span class="close">&times;</span>`
    pictureData += `<img class="modal-content" id="thisImg"></div>`
  })
  document.getElementById("card-content").innerHTML= pictureData;
  document.getElementById("pagination").style.display= "none";
  document.getElementById("back-button").style.display= "inline-block";

  //View individual pictures.
  var modal = document.getElementById("myModal");
  var img = document.getElementsByClassName("pic");
  var modalImg = document.getElementById("thisImg");

  for(var i=0;i<img.length;i++) {
    var image = img[i];
    image.onclick = function() {
      modal.style.display = "block";
      modalImg.src = this.src;
    }
  }
  var span = document.getElementsByClassName("close")[0];
  span.onclick = function() {
    modal.style.display = "none"; 
  }
}

//Display tags.
async function displayTags() {
  await getTagsData();
  var tagsData = "";
  var title = document.getElementById("image-title");

  sortedData.forEach(tags => {
    tagsData += `<div class="tags" id="${(tags.tags_name)}">`
    tagsData += `<a href="#">#${(tags.tags_name)}</a></div>`
  })
  document.getElementById("tags-list").innerHTML= tagsData;

  var tags = document.getElementsByClassName("tags");
  for(var i=0;i<tags.length;i++) {
    var tagsButton = tags[i]
    tagsButton.onclick = function() {
      var input = this.id;
      console.log(input);
      title.innerHTML = "#"+input;
      const filterAlbumsByTag = data.filter(album => {
        return album.tags.some(row => row.tags_name.includes(input));
      })
    console.log(filterAlbumsByTag);
    displayAlbumFromTag(filterAlbumsByTag);
    }
  }
}
async function displayAlbumFromTag (datas) { 
  const albumData = datas.map(album => {
    return `<div class="card">
    <div class="card-image" data-href="#" onClick="displayPictures(this.id)" id="${(album.albums_id)}" ><img class="pics" src="${(album.cover)}" alt="${(album.album_name)}"></div>
    <div class="card-info" id="card"><h5 class="album-title">${(album.album_name)}</h5></div></div>`;
  }).join('');
  document.getElementById("card-content").innerHTML= albumData;
  document.getElementById("back-button").style.display= "inline-block";
  document.getElementById("pagination").style.display= "none";
  //Change the album name corresponding to where the user clicked into.
  var cards = document.getElementsByClassName("pics");
  for(var i=0;i<cards.length;i++) {
    var titleCard = cards[i];
    titleCard.onclick = function() {
      title.innerHTML = this.alt;
    }
  }
}

displayTags();

//Pagination navigation functions.
function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    document.getElementById("current-page").innerHTML = currentPage;
    displayAlbum(data, currentPage);
    $('html,body').scrollTop(0);
  }
}
function nextPage() {
  if ((currentPage * pageSize) < data.length) {
    currentPage++;
    document.getElementById("current-page").innerHTML = currentPage;
    displayAlbum(data, currentPage);
    $('html,body').scrollTop(0);
  }
}
//Used to count number of pages available for the next page button.
function numberOfPages() {
  return Math.ceil(data.length / pageSize);
}
//Back to previous page.
function backButton() {
  displayAlbum(data);
  $('html,body').scrollTop(0);
}
//Function to remove duplicate tags.
function removeDuplicate(array, property) {
  const uniqueIds = [];
  const unique = array.filter(element => {
    const isDuplicate = uniqueIds.includes(element[property]);
    if(!isDuplicate) {
      uniqueIds.push(element[property]);
      return true;
    }
    return false;
  })
  return unique;
}
//Implement functions above.
document.querySelector("#prevButton").addEventListener('click', previousPage, false)
document.querySelector("#nextButton").addEventListener('click', nextPage, false)
document.querySelector("#back").addEventListener('click', backButton, false)