function logout() {
  firebase.auth().signOut()
    .then(() => window.location.href = "/index.html")
    .catch(() => showToast("Erro ao Fazer Logout"));
}

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.toggle('active', section.id === sectionId);
  });

  document.querySelectorAll('.sidebar nav li').forEach(item => {
    item.classList.toggle('active', item.dataset.section === sectionId);
  });
}

// Ícones para as criptomoedas (Bootstrap Icons)
const cryptoIcons = {
  bitcoin: 'bi-currency-bitcoin',
  ethereum: 'bi-currency-dollar',
  dogecoin: 'bi-cash-stack',
  solana: 'bi-lightning-charge-fill'
};

const cryptoList = [
  { id: "bitcoin", name: "Bitcoin (BTC)" },
  { id: "ethereum", name: "Ethereum (ETH)" },
  { id: "dogecoin", name: "Dogecoin (DOGE)" },
  { id: "solana", name: "Solana (SOL)" },
];

const cryptoSelect = document.getElementById("crypto-select");
const favToggleBtn = document.getElementById("fav-toggle");
const favoritesList = document.getElementById("favorites-list");

let favorites = [];

function loadCryptos() {
  cryptoSelect.innerHTML = '';
  cryptoList.forEach(crypto => {
    const option = document.createElement("option");
    option.value = crypto.id;
    option.textContent = crypto.name;
    cryptoSelect.appendChild(option);
  });
}

function showResult(html, isError = false) {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = html;
  resultDiv.style.color = isError ? "#f44336" : "white";
}

function showLoading() {
  document.getElementById("loading-overlay").style.display = "flex";
}
function hideLoading() {
  document.getElementById("loading-overlay").style.display = "none";
}

async function convertCrypto() {
  const cryptoId = cryptoSelect.value;
  const amount = parseFloat(document.getElementById("amount").value);

  if (!cryptoId || isNaN(amount) || amount <= 0) {
    showResult("Digite uma quantidade válida.", true);
    return;
  }

  try {
    showLoading();
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=brl,usd`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
    const data = await res.json();

    if (!data[cryptoId]) throw new Error("Dados inválidos da API");

    const brl = data[cryptoId].brl * amount;
    const usd = data[cryptoId].usd * amount;

    showResult(`
      <p>💰 Valor em <strong>Reais (BRL)</strong>: <br/> R$ ${brl.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p><br/>
      <p>💵 Valor em <strong>Dólares (USD)</strong>: <br/> $ ${usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
    `);

    const user = firebase.auth().currentUser;
    const db = firebase.firestore();

    await db.collection("users")
      .doc(user.uid)
      .collection("conversions")
      .add({
        crypto: cryptoId,
        amount,
        brl,
        usd,
        date: firebase.firestore.FieldValue.serverTimestamp()
      });

    await loadHistory();

  } catch (error) {
    showResult(`Erro ao buscar dados: ${error.message}`, true);
    console.error(error);
  } finally {
    hideLoading();
  }
}

async function loadHistory() {
  const user = firebase.auth().currentUser;
  const db = firebase.firestore();

  const historyList = document.getElementById("history-list");
  historyList.innerHTML = "<li>Carregando...</li>";

  try {
    const snapshot = await db
      .collection("users")
      .doc(user.uid)
      .collection("conversions")
      .orderBy("date", "desc")
      .limit(10)
      .get();

    if (snapshot.empty) {
      historyList.innerHTML = "<li>Você ainda não fez nenhuma conversão.</li>";
      return;
    }

    historyList.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();
      const dateObj = data.date ? data.date.toDate() : new Date();
      const dateStr = dateObj.toLocaleString("pt-BR");

      const item = document.createElement("li");
      item.innerHTML = `
        <strong>${data.crypto.toUpperCase()}</strong> - ${data.amount} <br/>
        💰 R$ ${data.brl.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} <br/>
        💵 $ ${data.usd.toLocaleString("en-US", { minimumFractionDigits: 2 })} <br/>
        📅 ${dateStr}
      `;
      historyList.appendChild(item);
    });

  } catch (error) {
    historyList.innerHTML = "<li>Erro ao carregar histórico.</li>";
    console.error(error);
  }
}

// Atualiza ícone da estrela
function updateFavIcon() {
  const currentCrypto = cryptoSelect.value;
  favToggleBtn.innerHTML = '';
  const icon = document.createElement('i');
  icon.classList.add('bi');
  icon.classList.add(favorites.includes(currentCrypto) ? 'bi-star-fill' : 'bi-star');
  favToggleBtn.appendChild(icon);
}

// Renderiza lista de favoritos com ícone
function renderFavorites() {
  favoritesList.innerHTML = '';

  if (favorites.length === 0) {
    favoritesList.innerHTML = '<li>Nenhuma criptomoeda favorita.</li>';
    return;
  }

  favorites.forEach(favId => {
    const crypto = cryptoList.find(c => c.id === favId);
    const li = document.createElement('li');

    const icon = document.createElement('i');
    icon.classList.add('bi', cryptoIcons[favId] || 'bi-currency-bitcoin');
    icon.style.marginRight = '8px';

    li.appendChild(icon);
    li.appendChild(document.createTextNode(crypto ? crypto.name : favId));

    favoritesList.appendChild(li);
  });
}

// Salva/Remove favorito no Firestore
async function toggleFavorite() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const currentCrypto = cryptoSelect.value;
  const db = firebase.firestore();
  const favRef = db.collection("users").doc(user.uid).collection("favorites").doc(currentCrypto);

  const exists = favorites.includes(currentCrypto);

  if (exists) {
    await favRef.delete();
    favorites = favorites.filter(fav => fav !== currentCrypto);
  } else {
    await favRef.set({ addedAt: firebase.firestore.FieldValue.serverTimestamp() });
    favorites.push(currentCrypto);
  }

  updateFavIcon();
  renderFavorites();
}

// Carrega favoritos do Firestore
async function loadFavoritesFromFirestore() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const snapshot = await firebase.firestore()
    .collection("users")
    .doc(user.uid)
    .collection("favorites")
    .get();

  favorites = snapshot.docs.map(doc => doc.id);

  updateFavIcon();
  renderFavorites();
}

// Listeners
cryptoSelect.addEventListener('change', updateFavIcon);
favToggleBtn.addEventListener('click', toggleFavorite);

// Inicialização
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "../../pages/index.html";
  } else {
    document.getElementById("user-email").innerText = user.email;
    loadCryptos();
    loadHistory();
    loadFavoritesFromFirestore(); // ← FAVORITOS POR USUÁRIO
  }
});
