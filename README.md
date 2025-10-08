# CSP2 E-Commerce API

## Overview
This is the Capstone 2 E-Commerce API project, developed as a collaborative team project.  
It provides user authentication, product management, cart functionality, and order processing for an e-commerce platform.

## Team Members
- **Student One** – Joseph Gabriel Belita - Handled user, product resources, cart, and order resources  
- **Student Two** – Isaac Domingo

 User: Credentials
* Admin User
- email: admin@example.com
- password: AdminPass1

* Dummy Customer
- email: user@example.com
- password: UserPass1

Features: 

Features by Student One
**User Resources**
- User registration
- User authentication
- Set user as admin (Admin only)
- Retrieve user details
- Update password
- Update profile information
- Upload profile image
- Forgot password functionality
- Reset password with token
- Get all users (Admin only)
- Check email existence

**Product Resources**
- Create product (Admin only)
- Retrieve all products
- Retrieve all active products
- Retrieve single product
- Update product information (Admin only)
- Archive product (Admin only)
- Activate product (Admin only)
- Search products by name
- Search products by price range
- Get products by category
- Upload product images
- Get new arrivals

**Cart Resources**
- Get user's cart
- Add to cart
- Subtotal for each item
- Total price for all items
- Change product quantities
- Remove products from cart
- Clear cart

**Order Resources**
- Non-admin user checkout (Create order)
- Retrieve authenticated user's orders
- Retrieve all orders (Admin only)



## API Routes Overview

### User Routes (`/users`)
| Method | Route                         | Description                         |
|--------|-------------------------------|-------------------------------------|
| POST   | /users/check-email             | Check if email exists               |
| POST   | /users/register                | Register new user                   |
| POST   | /users/login                   | User authentication                 |
| GET    | /users/details                 | Retrieve user details (Auth required) |
| PUT    | /users/update-password         | Update password (Auth required)     |
| PUT    | /users/profile                 | Update profile information (Auth required) |
| PATCH  | /users/:id/set-as-admin        | Set user as admin (Admin only)      |
| POST   | /users/upload-profile-image    | Upload profile image (Auth required) |
| GET    | /users/all                     | Get all users (Admin only)          |
| POST   | /users/forgot-password         | Request password reset              |
| POST   | /users/reset-password/:token   | Reset password with token           |

### Product Routes (`/products`)
| Method | Route                              | Description                       |
|--------|-----------------------------------|-----------------------------------|
| POST   | /products/                        | Create product (Admin only)        |
| GET    | /products/all                      | Retrieve all products (Admin only) |
| GET    | /products/active                   | Retrieve all active products       |
| GET    | /products/new-arrivals             | Get new arrival products           |
| GET    | /products/category/:category       | Get products by category           |
| POST   | /products/search-by-name           | Search products by name            |
| POST   | /products/search-by-price          | Search products by price range     |
| POST   | /products/upload-image             | Upload product image (Admin only)  |
| GET    | /products/:productId               | Retrieve single product            |
| PATCH  | /products/:productId/update        | Update product (Admin only)        |
| PATCH  | /products/:productId/archive       | Archive product (Admin only)       |
| PATCH  | /products/:productId/activate      | Activate product (Admin only)      |

### Cart Routes (`/cart`)
| Method | Route                            | Description                        |
|--------|---------------------------------|------------------------------------|
| GET    | /cart/get-cart                   | Get user's cart (Auth required)    |
| POST   | /cart/add-to-cart                | Add items to cart (Auth required)  |
| PATCH  | /cart/update-cart-quantity       | Change product quantities (Auth required) |
| PATCH  | /cart/:productId/remove-from-cart| Remove products from cart (Auth required) |
| PUT    | /cart/clear-cart                 | Clear cart (Auth required)         |

### Order Routes (`/orders`)
| Method | Route                 | Description                         |
|--------|----------------------|-------------------------------------|
| POST   | /orders/checkout      | Non-admin user checkout (Auth required) |
| GET    | /orders/my-orders     | Retrieve authenticated user's orders (Auth required) |
| GET    | /orders/all-orders    | Retrieve all orders (Admin only)    |