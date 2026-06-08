const loginScreen =
document.getElementById("login-screen");

const app =
document.getElementById("app");

const loginBtn =
document.getElementById("login-btn");

const logoutBtn =
document.getElementById("logout-btn");

const addBtn =
document.getElementById("add-btn");

const moviesList =
document.getElementById("movies-list");

const seriesList =
document.getElementById("series-list");

//bloqueio
const allowedUsers = [
  "gomcalvesdiasleonardo@gmail.com",
  "alineschafascheck@yahoo.com"
];

// LOGIN

loginBtn.addEventListener("click", async () => {

  const email =
  document.getElementById("email").value;

  const password =
  document.getElementById("password").value;

  if (!allowedUsers.includes(email)) {
  alert("Acesso não permitido.");
  return;
}

  const { error } =
  await client.auth.signInWithPassword({
    email,
    password
  });

if (error) {

  const { error: signupError } =
  await client.auth.signUp({
    email,
    password
  });

  if (signupError) {
    alert(signupError.message);
    return;
  }

  alert("Conta criada com sucesso!");

  // faz login automaticamente

  await client.auth.signInWithPassword({
    email,
    password
  });
}

  checkUser();
});


// LOGOUT

logoutBtn.addEventListener("click", async () => {

  await client.auth.signOut();

  location.reload();
});


// VERIFICAR LOGIN

async function checkUser() {

  const {
    data: { session }
  } = await client.auth.getSession();

  if (session) {

    loginScreen.classList.add("hidden");

    app.classList.remove("hidden");

    loadItems();

  } else {

    loginScreen.classList.remove("hidden");

    app.classList.add("hidden");
  }
}


// ADICIONAR ITEM

addBtn.addEventListener("click", async () => {

  const title =
  document.getElementById("title").value;

  const type =
  document.getElementById("type").value;

  const platform =
  document.getElementById("platform").value;

  const imageFile =
  document.getElementById("image").files[0];

  let image_url = "";

  // upload imagem

  if (imageFile) {

    const fileName =
    Date.now() + imageFile.name;

    const { error: uploadError } =
    await client.storage
      .from("watchlist-images")
      .upload(fileName, imageFile);

    if (!uploadError) {

      const {
        data
      } = client.storage
        .from("watchlist-images")
        .getPublicUrl(fileName);

      image_url = data.publicUrl;
    }
  }

  // salvar banco

  await client
    .from("watchlist")
    .insert([
      {
        title,
        type,
        platform,
        image_url
        
      }
    ]);

  loadItems();

    document.getElementById("title").value = "";
    document.getElementById("type").value = "Filme";
    document.getElementById("platform").value = "Netflix";
    document.getElementById("image").value = "";
});


// CARREGAR ITENS

async function loadItems() {

  moviesList.innerHTML = "";
  seriesList.innerHTML = "";

  const { data } =
  await client
    .from("watchlist")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  data.forEach(item => {

    const card = document.createElement("div");

    card.classList.add("card");

    card.innerHTML = `
      <img src="${item.image_url}">
      <div class="card-content">

        <h3>${item.title}</h3>

        <p class="platform">
          ${item.platform}
        </p>

        <p>
          Adicionado:
          ${new Date(item.created_at)
            .toLocaleDateString()}
        </p>

        ${item.watched_at ? `
        <p class="watched">
            Assistido em:
            ${new Date(item.watched_at).toLocaleDateString()}
        </p>
` : ""}
        
        <button onclick="toggleWatched(${item.id}, ${item.watched})">
        ${item.watched
            ? "Assistido"
            : "Marcar Assistido"}
        </button>

        <button onclick="deleteItem(${item.id})"
        class="delete-btn">
        Excluir
        </button>


      </div>
    `;

    if (item.type === "Filme") {
      moviesList.appendChild(card);
    } else {
      seriesList.appendChild(card);
    }
  });
}


// ASSISTIDO

async function toggleWatched(id, watched) {

  await client
    .from("watchlist")
    .update({
      watched: !watched,
      watched_at: !watched ? new Date().toISOString() : null
    })
    .eq("id", id);

  loadItems();
}


// TEMPO REAL

client
.channel("watchlist-realtime")

.on(
  "postgres_changes",
  {
    event: "*",
    schema: "public",
    table: "watchlist"
  },
  () => {
    loadItems();
  }
)

.subscribe();


checkUser();

async function deleteItem(id) {

  const confirmDelete =
  confirm("Deseja excluir este item?");

  if (!confirmDelete) return;

  const { error } =
  await client
    .from("watchlist")
    .delete()
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  loadItems();
}


function showSection(sectionId) {

  const sections =
  document.querySelectorAll(".section-content");

  sections.forEach(section => {
    section.classList.remove("active");
  });

  document
    .getElementById(sectionId)
    .classList.add("active");
}


// abrir filmes inicialmente

document
.getElementById("movies-section")
.classList.add("active");