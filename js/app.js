import { initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore, query as firestoreQuery, where } from 'firebase/firestore/lite';

const firebaseConfig = {
  apiKey: 'AIzaSyDrRwMw4nbBFHp_Oo0XkZZKhNzJHdDNPQk',
  authDomain: 'oda-delivery.firebaseapp.com',
  projectId: 'oda-delivery',
  storageBucket: 'oda-delivery.firebasestorage.app',
  messagingSenderId: '52314938782',
  appId: '1:52314938782:web:c0dc0355739c69e7000a8f'
};
const STORE_ID = 'LOJA_AC2933AB';
const db = getFirestore(initializeApp(firebaseConfig));
let products = [];

let categories = ['Todos'];
const money = value => value.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
let selectedCategory = 'Todos';
let query = '';
const cart = new Map();
const grid = document.querySelector('#product-grid');

function renderCategories(){
  document.querySelector('#categories').innerHTML = categories.map(category =>
    `<button class="category ${category === selectedCategory ? 'active' : ''}" data-category="${category}" aria-pressed="${category === selectedCategory}">${category}</button>`
  ).join('');
}
function renderProducts(){
  const filtered = products.filter(product => (selectedCategory === 'Todos' || product.category === selectedCategory) && `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(query.toLowerCase()));
  grid.innerHTML = filtered.length ? filtered.map(product => `
    <article class="product-card">
      <div class="product-image"><img loading="lazy" src="${window.OdaCatalog.imageUrl(product.image)}" alt="${product.name}" onerror="this.onerror=null;this.src='img/product-placeholder.svg'">${product.badge ? `<span class="badge">${product.badge}</span>` : ''}</div>
      <div class="product-info"><div class="product-title-row"><h3 class="product-title">${product.name}</h3><span class="product-price">${money(product.price)}</span></div><p class="product-desc">${product.description}</p><button class="add-button" data-add="${product.id}">+ Adicionar</button></div>
    </article>`).join('') : '<p class="no-results">Nenhum item encontrado. Tente outra busca.</p>';
}
function renderCart(){
  const items = [...cart.values()];
  const count = items.reduce((sum,item) => sum + item.quantity, 0);
  document.querySelector('#cart-count').textContent = count;
  document.querySelector('#cart-empty').hidden = items.length > 0;
  document.querySelector('#cart-bottom').hidden = items.length === 0;
  if (!items.length) showCheckout(false);
  document.querySelector('#cart-items').innerHTML = items.map(({product,quantity}) => `
    <div class="cart-item"><img src="${window.OdaCatalog.imageUrl(product.image, 160)}" alt=""><div class="cart-item-info"><b>${product.name}</b><small>${money(product.price * quantity)}</small><div class="qty-controls"><button data-qty="-1" data-id="${product.id}" aria-label="Remover um">−</button><span>${quantity}</span><button data-qty="1" data-id="${product.id}" aria-label="Adicionar um">+</button></div></div></div>`).join('');
  document.querySelector('#cart-total').textContent = money(items.reduce((sum,item) => sum + item.product.price * item.quantity, 0));
}
function toggleCart(open){
  document.querySelector('#cart-drawer').classList.toggle('open',open);
  document.querySelector('#cart-backdrop').classList.toggle('open',open);
  document.querySelector('#cart-drawer').setAttribute('aria-hidden',String(!open));
}

function guessCategory(product){
  if (product.category || product.categoria) return product.category || product.categoria;
  if (product.isAcai) return 'Açaí';
  const name = (product.nome || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (name.includes('pastel')) return 'Pastéis';
  if (name.includes('yakisoba')) return 'Yakisoba';
  if (name.includes('combo')) return 'Combos';
  if (/bebida|refrigerante|suco|agua|coca|guarana/.test(name)) return 'Bebidas';
  return 'Outros';
}

async function loadProducts(){
  grid.innerHTML = '<p class="no-results">Carregando cardápio...</p>';
  try {
    const productsRef = collection(db, `stores/${STORE_ID}/produtos`);
    const activeProducts = firestoreQuery(productsRef, where('ativo', '==', true), where('excluido', '==', false));
    const snapshot = await getDocs(activeProducts);
    products = snapshot.docs.map(document => {
      const data = document.data();
      return {
        id: data.uuidRemote || document.id,
        name: data.nome || 'Produto',
        description: data.descricao || '',
        price: Number(data.precoVenda) || 0,
        image: data.fotoUrl || '',
        badge: data.badge || '',
        category: guessCategory(data)
      };
    });
    categories = ['Todos', ...new Set(products.map(product => product.category))];
    renderCategories();
    renderProducts();
  } catch (error) {
    console.error('Falha ao buscar o cardápio no Firebase:', error);
    grid.innerHTML = '<p class="no-results">Não foi possível carregar o cardápio agora. Tente novamente em instantes.</p>';
  }
}

document.querySelector('#categories').addEventListener('click', event => {
  const button = event.target.closest('[data-category]'); if(!button) return;
  selectedCategory = button.dataset.category; renderCategories(); renderProducts();
});
document.querySelector('#search').addEventListener('input', event => {query = event.target.value; renderProducts();});
document.querySelector('#product-grid').addEventListener('click', event => {
  const button = event.target.closest('[data-add]'); if(!button) return;
  const product = products.find(item => String(item.id) === button.dataset.add);
  const item = cart.get(product.id) || {product,quantity:0}; item.quantity++; cart.set(product.id,item); renderCart();
  button.textContent = '✓ Adicionado'; setTimeout(() => {if(button.isConnected) button.textContent = '+ Adicionar';},900);
});
document.querySelector('#cart-items').addEventListener('click', event => {
  const button = event.target.closest('[data-qty]'); if(!button) return;
  const id = button.dataset.id, item = cart.get(id); item.quantity += Number(button.dataset.qty);
  if(item.quantity <= 0) cart.delete(id); renderCart();
});
document.querySelector('#open-cart').addEventListener('click',() => {showCheckout(false);toggleCart(true);});
document.querySelector('#close-cart').addEventListener('click',() => toggleCart(false));
document.querySelector('#cart-backdrop').addEventListener('click',() => toggleCart(false));
document.addEventListener('keydown',event => {if(event.key === 'Escape') toggleCart(false); if((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'){event.preventDefault();document.querySelector('#search').focus();}});
function showCheckout(show){
  document.querySelector('#cart-items').hidden = show;
  document.querySelector('#cart-empty').hidden = show || cart.size > 0;
  document.querySelector('#cart-bottom').hidden = show || cart.size === 0;
  document.querySelector('#checkout-panel').hidden = !show;
  document.querySelector('#drawer-title').innerHTML = show ? 'Finalizar <em>pedido</em>' : 'Sua <em>sacola</em>';
  if(show){
    const items = [...cart.values()];
    document.querySelector('#checkout-review').innerHTML = `<strong>Resumo do pedido</strong>${items.map(({product,quantity}) => `<div><span>${quantity}x ${product.name}</span><b>${money(product.price*quantity)}</b></div>`).join('')}<div class="review-total"><span>Subtotal</span><b>${money(items.reduce((sum,item)=>sum+item.product.price*item.quantity,0))}</b></div>`;
  }
}
document.querySelector('#checkout').addEventListener('click',() => {if(cart.size) showCheckout(true);});
document.querySelector('#back-to-cart').addEventListener('click',() => showCheckout(false));
document.querySelector('#checkout-panel').addEventListener('change', event => {
  if(event.target.name === 'fulfillment'){
    const delivery = event.target.value === 'Entrega';
    document.querySelector('#address-fields').hidden = !delivery;
    document.querySelector('#pickup-note').hidden = delivery;
    ['address','neighborhood'].forEach(id => document.querySelector(`#${id}`).required = delivery);
  }
  if(event.target.name === 'payment') document.querySelector('#change-field').hidden = event.target.value !== 'Dinheiro';
});
document.querySelector('#checkout-panel').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if(!form.reportValidity()) return;
  const data = new FormData(form);
  const items = [...cart.values()];
  const subtotal = items.reduce((sum,item)=>sum+item.product.price*item.quantity,0);
  const fulfillment = data.get('fulfillment');
  const address = fulfillment === 'Entrega' ? `\nEndere\u00e7o: ${data.get('address')}\nBairro: ${data.get('neighborhood')}${data.get('complement') ? `\nComplemento: ${data.get('complement')}` : ''}` : '\nRetirada no local: Av. Cabu\u00e7u, 272, Nossa Sra. do Sion, Itanha\u00e9m.';
  const change = data.get('payment') === 'Dinheiro' && document.querySelector('#change-for').value ? `\nTroco para: ${document.querySelector('#change-for').value}` : '';
  const message = [`Ol\u00e1! Quero fazer este pedido na Oda Delivery:`,``,...items.map(({product,quantity}) => `${quantity}x ${product.name} - ${money(product.price*quantity)}`),``,`Subtotal: ${money(subtotal)}`,`Nome: ${data.get('name') || 'N\u00e3o informado'}`,`Pagamento: ${data.get('payment')}`,`Recebimento: ${fulfillment}${address}${change}`, ...(fulfillment === 'Entrega' ? ['Taxa de entrega: a confirmar após o envio desta mensagem.'] : [])].join('\n');
  window.open(`https://wa.me/5513997776305?text=${encodeURIComponent(message)}`,'_blank','noopener,noreferrer');
});

renderCategories(); renderCart(); loadProducts();
