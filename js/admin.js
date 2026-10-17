const form = document.querySelector('#product-form');
const list = document.querySelector('#admin-items');
const message = document.querySelector('#form-message');
let products = window.OdaCatalog.getProducts();

function saveCatalog() {
  window.OdaCatalog.saveProducts(products);
  renderProducts();
}

function renderProducts() {
  document.querySelector('#item-count').textContent = `(${products.length})`;
  const categoryOptions = [...new Set(products.map(product => product.category).filter(Boolean))];
  document.querySelector('#category-options').innerHTML = categoryOptions.map(category => `<option value="${escapeHtml(category)}"></option>`).join('');
  list.replaceChildren();
  if (!products.length) {
    const empty = document.createElement('p');
    empty.className = 'admin-empty';
    empty.textContent = 'Seu cardápio está vazio. Adicione o primeiro produto ao lado.';
    list.append(empty);
    return;
  }

  [...products].sort((a,b) => a.category.localeCompare(b.category, 'pt-BR') || a.name.localeCompare(b.name, 'pt-BR')).forEach(product => {
    const row = document.createElement('article');
    row.className = 'admin-product';
    const image = document.createElement('img');
    image.src = window.OdaCatalog.imageUrl(product.image, 160);
    image.alt = '';
    image.onerror = () => { image.src = window.OdaCatalog.imageUrl('photo-1612929633738-8fe44f7ec841', 160); };
    const copy = document.createElement('div');
    copy.className = 'admin-product-copy';
    const name = document.createElement('strong');
    name.textContent = product.name;
    const info = document.createElement('small');
    info.textContent = `${product.category} · ${Number(product.price).toLocaleString('pt-BR', {style:'currency',currency:'BRL'})}`;
    copy.append(name, info);
    const actions = document.createElement('div');
    actions.className = 'admin-product-actions';
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.textContent = 'Editar';
    edit.addEventListener('click', () => editProduct(product.id));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Excluir';
    remove.addEventListener('click', () => deleteProduct(product.id));
    actions.append(edit, remove);
    row.append(image, copy, actions);
    list.append(row);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
}

function clearForm() {
  form.reset();
  document.querySelector('#product-id').value = '';
  document.querySelector('#form-title').textContent = 'Adicionar item';
  document.querySelector('#save-button').innerHTML = 'Adicionar produto <span>→</span>';
  document.querySelector('#cancel-edit').hidden = true;
  message.textContent = '';
}

function editProduct(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;
  document.querySelector('#product-id').value = String(product.id);
  document.querySelector('#name').value = product.name;
  document.querySelector('#category').value = product.category;
  document.querySelector('#price').value = product.price;
  document.querySelector('#description').value = product.description || '';
  document.querySelector('#image').value = /^https?:\/\//i.test(product.image || '') ? product.image : '';
  document.querySelector('#badge').value = product.badge || '';
  document.querySelector('#form-title').textContent = 'Editar produto';
  document.querySelector('#save-button').innerHTML = 'Salvar alterações <span>→</span>';
  document.querySelector('#cancel-edit').hidden = false;
  message.textContent = '';
  document.querySelector('#name').focus();
  window.scrollTo({top:0, behavior:'smooth'});
}

function deleteProduct(id) {
  const product = products.find(item => item.id === id);
  if (!product || !window.confirm(`Excluir “${product.name}” do cardápio deste navegador?`)) return;
  products = products.filter(item => item.id !== id);
  saveCatalog();
  message.textContent = 'Produto excluído.';
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const idValue = document.querySelector('#product-id').value;
  const existing = idValue ? products.find(item => item.id === Number(idValue)) : null;
  const imageValue = document.querySelector('#image').value.trim();
  const product = {
    id: existing ? existing.id : Math.max(0, ...products.map(item => Number(item.id) || 0)) + 1,
    name: document.querySelector('#name').value.trim(),
    category: document.querySelector('#category').value.trim(),
    price: Number(document.querySelector('#price').value),
    description: document.querySelector('#description').value.trim(),
    badge: document.querySelector('#badge').value.trim(),
    image: imageValue || (existing && existing.image) || 'photo-1612929633738-8fe44f7ec841'
  };
  if (!product.name || !product.category || !Number.isFinite(product.price) || product.price < 0) return;
  if (existing) products = products.map(item => item.id === existing.id ? product : item);
  else products.push(product);
  try {
    saveCatalog();
    clearForm();
    message.textContent = existing ? 'Alterações salvas neste navegador.' : 'Produto adicionado neste navegador.';
  } catch (error) {
    message.textContent = 'Não foi possível salvar. O armazenamento do navegador pode estar cheio.';
  }
});

document.querySelector('#cancel-edit').addEventListener('click', clearForm);
document.querySelector('#reset-catalog').addEventListener('click', () => {
  if (!window.confirm('Apagar suas alterações locais e restaurar os produtos de demonstração?')) return;
  localStorage.removeItem(window.OdaCatalog.storageKey);
  products = window.OdaCatalog.getProducts();
  clearForm();
  renderProducts();
  message.textContent = 'Produtos de demonstração restaurados.';
});
document.querySelector('#export-catalog').addEventListener('click', () => {
  const file = new Blob([JSON.stringify(products, null, 2)], {type:'application/json'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = 'oda-cardapio.json';
  link.click();
  URL.revokeObjectURL(link.href);
});

renderProducts();
