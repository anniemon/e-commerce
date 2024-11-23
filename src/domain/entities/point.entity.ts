import { TransactionType } from '@domain/enums';

export class UserPointEntity {
  id: number;
  name: string;
  email: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export class PointTransactionEntity {
  id: number;
  userId: number;
  transactionType: TransactionType;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}
