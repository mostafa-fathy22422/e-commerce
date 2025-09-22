// /// <reference lib="webworker" />
//
// import { Product } from "../../core/models/API.interface";
//
// addEventListener('message', ({ data }) => {
//   const { allProducts, search } = data;
//
//   let filtered: Product[] = [];
//
//   if (!search) {
//     filtered = allProducts;
//   } else {
//     const lowerCaseSearch = search.toLowerCase();
//     filtered = allProducts.filter(p =>
//       p.title.toLowerCase().includes(lowerCaseSearch)
//     );
//   }
//
//   postMessage(filtered);
// });
