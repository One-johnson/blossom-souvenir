
export enum UserRole {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER'
}

export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum SouvenirStatus {
  AVAILABLE = 'AVAILABLE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  PREORDER = 'PREORDER'
}

export interface User {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  createdAt: number;
}

export interface Souvenir {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  status: SouvenirStatus;
  stock: number;
  createdAt: number;
  updatedAt: number;
}

export interface CartItem {
  _id: string;
  userId: string;
  souvenirId: string;
  quantity: number;
  souvenir?: Souvenir;
}

export interface Order {
  _id: string;
  userId: string;
  items: {
    souvenirId: string;
    quantity: number;
    priceAtTime: number;
  }[];
  totalPrice: number;
  status: 'PENDING_WHATSAPP' | 'COMPLETED' | 'CANCELLED';
  createdAt: number;
}

export interface Notification {
  _id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: number;
}
