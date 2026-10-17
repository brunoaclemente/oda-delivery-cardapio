(() => {
  const STORAGE_KEY = 'oda-delivery-products-v1';
  const initialProducts = [
    {id:1,name:'Yakisoba tradicional',category:'Yakisoba',price:32.9,description:'Macarrão, legumes salteados e molho especial da casa.',badge:'QUERIDINHO',image:'photo-1612929633738-8fe44f7ec841'},
    {id:2,name:'Yakisoba de frango',category:'Yakisoba',price:36.9,description:'Frango, legumes frescos e aquele molho bem caprichado.',badge:'',image:'photo-1585032226651-759b368d7246'},
    {id:3,name:'Yakisoba misto',category:'Yakisoba',price:42.9,description:'Uma combinação generosa para matar a fome de verdade.',badge:'BEM SERVIDO',image:'photo-1569718212165-3a8278d5f624'},
    {id:4,name:'Pastel de carne',category:'Pastéis',price:12.0,description:'Massa crocante, recheio saboroso e feito na hora.',badge:'',image:'photo-1625220194771-7ebdea0b70b9'},
    {id:5,name:'Pastel de queijo',category:'Pastéis',price:12.0,description:'Queijo derretido por dentro, crocância por fora.',badge:'',image:'photo-1608039829572-78524f79c4c7'},
    {id:6,name:'Pastel especial',category:'Pastéis',price:16.0,description:'Recheio especial da casa para deixar o pedido completo.',badge:'',image:'photo-1626700051175-6818013e1d4f'},
    {id:7,name:'Açaí 300 ml',category:'Açaí',price:18.0,description:'Açaí cremoso com acompanhamentos à sua escolha.',badge:'GELADINHO',image:'photo-1511690743698-d9d85f2fbf38'},
    {id:8,name:'Açaí 500 ml',category:'Açaí',price:25.0,description:'Mais açaí, mais complementos e mais felicidade.',badge:'',image:'photo-1494736797933-d0501ba2fe65'},
    {id:9,name:'Combo pastel + bebida',category:'Combos',price:22.0,description:'Um pastel crocante e bebida gelada para acompanhar.',badge:'COMBO',image:'photo-1565299624946-b28f40a0ae38'},
    {id:10,name:'Refrigerante lata',category:'Bebidas',price:7.0,description:'Lata 350 ml bem gelada para acompanhar seu pedido.',badge:'',image:'photo-1629203851122-3726ecdf080e'}
  ];

  function getProducts() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (error) {
      console.warn('Não foi possível ler o cardápio salvo neste navegador.', error);
    }
    return initialProducts.map(product => ({...product}));
  }

  function saveProducts(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }

  function imageUrl(image, width = 700) {
    if (!image) return `https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=${width}&q=80`;
    if (/^https?:\/\//i.test(image)) return image;
    return `https://images.unsplash.com/${image}?auto=format&fit=crop&w=${width}&q=80`;
  }

  window.OdaCatalog = {getProducts, saveProducts, imageUrl, storageKey: STORAGE_KEY};
})();
