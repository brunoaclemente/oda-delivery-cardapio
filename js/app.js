// Produtos editados no admin deste navegador ou lista demonstrativa inicial.
const products = window.OdaCatalog.getProducts();

const categories = ['Todos', ...new Set(products.map(product => product.category))];
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
      <div class="product-image"><img loading="lazy" src="${window.OdaCatalog.imageUrl(product.image)}" alt="${product.name}" onerror="this.src='${window.OdaCatalog.imageUrl('photo-1612929633738-8fe44f7ec841')}'">${product.badge ? `<span class="badge">${product.badge}</span>` : ''}</div>
      <div class="product-info"><div class="product-title-row"><h3 class="product-title">${product.name}</h3><span class="product-price">${money(product.price)}</span></div><p class="product-desc">${product.description}</p><button class="add-button" data-add="${product.id}">+ Adicionar</button></div>
    </article>`).join('') : '<p class="no-results">Nenhum item encontrado. Tente outra busca.</p>';
}
function renderCart(){
  const items = [...cart.values()];
  const count = items.reduce((sum,item) => sum + item.quantity, 0);
  document.querySelector('#cart-count').textContent = count;
  document.querySelector('#cart-empty').hidden = items.length > 0;
  document.querySelector('#cart-items').innerHTML = items.map(({product,quantity}) => `
    <div class="cart-item"><img src="${window.OdaCatalog.imageUrl(product.image, 160)}" alt=""><div class="cart-item-info"><b>${product.name}</b><small>${money(product.price * quantity)}</small><div class="qty-controls"><button data-qty="-1" data-id="${product.id}" aria-label="Remover um">−</button><span>${quantity}</span><button data-qty="1" data-id="${product.id}" aria-label="Adicionar um">+</button></div></div></div>`).join('');
  document.querySelector('#cart-total').textContent = money(items.reduce((sum,item) => sum + item.product.price * item.quantity, 0));
}
function toggleCart(open){
  document.querySelector('#cart-drawer').classList.toggle('open',open);
  document.querySelector('#cart-backdrop').classList.toggle('open',open);
  document.querySelector('#cart-drawer').setAttribute('aria-hidden',String(!open));
}

document.querySelector('#categories').addEventListener('click', event => {
  const button = event.target.closest('[data-category]'); if(!button) return;
  selectedCategory = button.dataset.category; renderCategories(); renderProducts();
});
document.querySelector('#search').addEventListener('input', event => {query = event.target.value; renderProducts();});
document.querySelector('#product-grid').addEventListener('click', event => {
  const button = event.target.closest('[data-add]'); if(!button) return;
  const product = products.find(item => item.id === Number(button.dataset.add));
  const item = cart.get(product.id) || {product,quantity:0}; item.quantity++; cart.set(product.id,item); renderCart();
  button.textContent = '✓ Adicionado'; setTimeout(() => {if(button.isConnected) button.textContent = '+ Adicionar';},900);
});
document.querySelector('#cart-items').addEventListener('click', event => {
  const button = event.target.closest('[data-qty]'); if(!button) return;
  const id = Number(button.dataset.id), item = cart.get(id); item.quantity += Number(button.dataset.qty);
  if(item.quantity <= 0) cart.delete(id); renderCart();
});
document.querySelector('#open-cart').addEventListener('click',() => toggleCart(true));
document.querySelector('#close-cart').addEventListener('click',() => toggleCart(false));
document.querySelector('#cart-backdrop').addEventListener('click',() => toggleCart(false));
document.addEventListener('keydown',event => {if(event.key === 'Escape') toggleCart(false); if((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'){event.preventDefault();document.querySelector('#search').focus();}});
document.querySelector('#checkout').addEventListener('click',() => alert('A finalização será ativada quando a integração de pedidos estiver disponível.'));

renderCategories(); renderProducts(); renderCart();
