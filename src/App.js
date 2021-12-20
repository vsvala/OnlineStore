import './App.css';
import React, {Component} from "react";
import axios from 'axios'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import Cart from './components/Cart';
import ProductList from './components/ProductList';
import Context from "./Context";



export default class APP extends Component{
  constructor(props){
    super(props);
    this.state={
      cart:{},
      products:[],
      notification:""
    };   
  }

  //Initiates the product list by getting producst from inventory service and set productstate also gets cartstate from localstore
  async componentDidMount(){
  let cart = localStorage.getItem("cart");
  //TODO try catch
  await axios.get('/api/products').then(response => {
  const products= response.data 
  cart = cart? JSON.parse(cart) : {};
  this.setState({ products:products, cart });
}) 
  }

//Adds product to shopping cart, saves state to localstore and to cart state
  addToCart = cartItem => {
    let cart = this.state.cart;
    if (cart[cartItem.id]) {
      cart[cartItem.id].amount += cartItem.amount;
    } else {
      cart[cartItem.id] = cartItem; 
    }
    if (cart[cartItem.id].amount > cart[cartItem.id].product.stock) {
      cart[cartItem.id].amount = cart[cartItem.id].product.stock;
    }   
    localStorage.setItem("cart", JSON.stringify(cart));
    this.setState({ cart });
  };

// removes item prom product cart
  removeFromCart = cartItemId => {
    let cart = this.state.cart;
    delete cart[cartItemId];
    localStorage.setItem("cart", JSON.stringify(cart));
    this.setState({ cart });
  };

 // clears whole product cart
  clearCart = () => {
    let cart = {};
    localStorage.removeItem("cart");
    this.setState({ cart });
  };

// Places order or if product out of stock clears cart, updates products and notifies user
checkout = async () => {
  const cart = this.state.cart;
  const orderList =[]

    for (const [key, value] of Object.entries(cart)) {
      const productId = value.product.id
      const productName = value.product.name
      const producPrice = value.product.price
      const productAmount = value.amount

      orderList.push({  id:productId, name:productName, amount:productAmount,  price:producPrice})
  }
  const order= { 
    products:orderList
  }
  
 try {
 const response= await axios.post( '/api/orders', order)
    //console.log('post response data from or orderservise to front', response.data)
  
    if (response.data.status === "OK") {
      //console.log("POST status OK getting products from inventory..")
      try {
      await axios.get('/api/products').then(response => {
     // console.log("response data, producst from invenrory after order",response.data)
      this.setState({ products:response.data });
     // console.log( "state after ordering products",  this.state.products);
      this.clearCart();
      this.setState({ notification:"Thank you for your order,  Order sent succefully"  });
      setTimeout(() => {
        this.setState({ notification:null });    
      }, 5000)
      })
    } catch (error) {
     // console.log("something went wrong with getting products state after failed order")
      this.setState({ notification: "Something went wrong, please refresh the page" });
      setTimeout(() => {
        this.setState({ notification:null });    
      }, 5000)
    }   
    }
    
   //If some products are not available, update product state, clear shopping cart and notify user to replace the order 
   if (response.data.status === "NOT_OK"){
      const notAvailable = response.data.products.filter(item=> item.status==="NOT_OK") 
      const noproducts=notAvailable.map(s=>s.name)
      this.setState({ notification: `OUT OF STOCK:  ${noproducts}   Please replace the order!!!!`});
      setTimeout(() => {
        this.setState({ notification:null });    
      }, 15000)
    
//fetch the newest product state from inventory service
  try {
      await axios.get('/api/products').then(response => {
        this.setState({ products:response.data });
        this.clearCart();
      })
      return response.data;

    } catch (error) {
      this.setState({ notification: "Something went wrong, please refresh the page" });
      setTimeout(() => {
        this.setState({ notification:null });    
      }, 5000)
   }   
  }
 return response.data;

} catch (error) {
    this.setState({ notification: 'Something went wrong. Please replace the order!.' });
    setTimeout(() => {
      this.setState({ notification:null });    
    }, 5000)
 } 
  }


render() {
    return (
      
      <Context.Provider
        value={{
          ...this.state,
          removeFromCart: this.removeFromCart,
          addToCart: this.addToCart,
          clearCart: this.clearCart,
          checkout: this.checkout,
          notifify:this.state.notification
        }}
      >
        <Router >
        <div className="App">
          <nav
            className="navbar container"
            role="navigation"
            aria-label="main navigation"
          >
            <div className="navbar-brand">
              <b className="navbar-item is-size-4">Online store</b>
            <label
                role="button"
                className="navbar-burger burger"
                aria-label="menu"
                aria-expanded="false"
                data-target="navbarBasicExample"
                onClick={e => {
                  e.preventDefault();
                  this.setState({ showMenu: !this.state.showMenu });
                }}
              >
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
              </label> 
            </div>

              <div className={`navbar-menu`}>
                <Link to="/" className="navbar-item">
                  Products
                </Link>
                <Link to="/cart" className="navbar-item">
                  Cart
                  <span
                    className="tag is-primary"
                    style={{ marginLeft: "5px" }}
                  >
                    { Object.keys(this.state.cart).length }
                  </span>
                </Link>
              </div>
            </nav>
            <Routes>
              <Route exact path="/" element={<ProductList/>} />
              <Route exact path="/cart" element={<Cart/>} />
            </Routes>
          </div>
        </Router>
      </Context.Provider>
    );
  }
}

