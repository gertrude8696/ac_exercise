const BASE_URL = "https://user-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/users/"

let users = []
const dataPanel = document.querySelector('#user-container')
const paginator = document.querySelector('#pagination')
const searchInput = document.querySelector('#search-input')
const searchSubmit = document.querySelector('#search-submit')
const navbar = document.querySelector('#navbar')
const love = document.querySelector('.love')
const info = document.querySelector('.modal-content')
const userPage = 16

// ---------------- request -----------------//

axios.get(INDEX_URL)
  .then(res => {
    users.push(...res.data.results)
    renderUserList(getUserPage(1))
    renderPaginator(users.length)
  })
  .catch(err => console.log(err))
  .finally(() => {
    getLover()
  })


// --------------- function ----------------//

function renderUserList(data) {
  let rawHTML = ''

  data.forEach(user => {
    rawHTML += `
        <div class="card d-flex align-items-center" style="width: 300px; min-height: 300px">
            <div class="love position-absolute " data-id="${user.id}">♥</div>
            <img class="card-img-top mt-5 mb-4 custom-rounded" style="width: 200px; height: 200px" src="${user.avatar}" alt="Card image cap" data-modal-user-id="${user.id}" data-bs-toggle="modal" data-bs-target="#user-modal">
            <div class="card-body" style="max-width: 300px" data-modal-user-id="${user.id}">
                <h5 class="card-title mb-0" data-modal-user-id="${user.id}">${user.name}</h5>
            </div>
        </div>`
  })
  dataPanel.innerHTML = rawHTML;
}

function renderPaginator(amount) {
  let numberOfPage = Math.ceil(amount / userPage)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `
        <li class="page-item "><a class="page-link" href="#" data-page="${page}">${page}</a></li>
        `
  }
  paginator.innerHTML = rawHTML
}

function getUserPage(page) {
  let startIndex = (page - 1) * userPage
  return users.slice(startIndex, startIndex + userPage)
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteUser')) || [];
  const user = users.find(user => user.id === id);

  if (list.some(user => user.id === id)) return;

  localStorage.setItem(`like_${id}`, 'true');
  list.push(user);
  localStorage.setItem('favoriteUser', JSON.stringify(list));
}

function deleteToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteUser')) || [];
  const index = list.findIndex(user => user.id === id);

  if (index === -1) return;

  localStorage.removeItem(`like_${id}`);
  list.splice(index, 1);
  localStorage.setItem('favoriteUser', JSON.stringify(list));
}

function showMoreInfo(id) {
  let rawHTML = ''
  const user = users.find(user => user.id === id)
  rawHTML += `
          <div class="modal-header">
            <h4>Information</h4>
          </div>
          <div class="modal-body d-flex justify-content-around align-items-center">
            <img class="modal-avatar mr-3" src="${user.avatar}" alt="Card image cap">
            <div class="modal-user-info">
                <p><i class="fa-regular fa-id-card"></i> ${user.name + user.surname}</p>
                <hr>
                <p><i class="fa-solid fa-image-portrait"></i> ${user.age} years old</p>
                <hr>
                <p><i class="fa-solid fa-person-half-dress"></i> ${user.gender} </p>
                <hr>
                <p><i class="fa-solid fa-baby"></i> ${user.birthday}</p>
                <hr>
                <p><i class="fa-solid fa-envelope"></i> ${user.email}</p>
            </div>
          </div>
          <div class="modal-footer d-grid gap-2 d-md-flex justify-content-md-end">
            <button type="button" class="btn btn-outline-secondary mt-0" data-bs-dismiss="modal" aria-label="Close">Close
            </button>
          </div>`

  info.innerHTML = rawHTML;
}

function getLover() {
  const loveIcons = document.querySelectorAll('.love');
  loveIcons.forEach(loveIcon => {
    const userId = loveIcon.dataset.id;
    const isLiked = localStorage.getItem(`like_${userId}`);

    if (isLiked === 'true') {
      loveIcon.classList.add('active')
    }
  })
}

// ------------- EventListener -------------//

navbar.addEventListener('submit', function onClickSubmit(e) {
  e.preventDefault();
  let keyword = searchInput.value.toLowerCase()
  let searchList = []
  if (!keyword.length) return

  users.forEach(user => {
    if ((user.name + user.surname).toLowerCase().includes(keyword)) {
      searchList.push(user)
    }
  })
  if (!searchList.length) return alert('User Not Found!')

  renderUserList(searchList)
  renderPaginator(searchList.length)
  getLover()
})

searchInput.addEventListener('input', e => {
  if (searchInput.value === '')
    renderUserList(getUserPage(1))
  getLover()
})

dataPanel.addEventListener('click', function onClickDataPanel(e) {
  if (e.target.matches('.love')) {
    const loveIcon = e.target
    const userId = loveIcon.dataset.id

    loveIcon.classList.toggle('active')

    if (loveIcon.classList.contains('active')) {
      addToFavorite(Number(userId));
      getLover()
    } else {
      deleteToFavorite(Number(userId));
      getLover()
    }
  } else if (e.target.matches('.custom-rounded')) {
    showMoreInfo(Number(e.target.dataset.modalUserId))
  } else {
    return;
  }
})

paginator.addEventListener('click', function onClickPaginator(e) {
  const page = e.target.dataset.page
  renderUserList(getUserPage(page))
  getLover()
})