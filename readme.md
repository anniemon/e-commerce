
# e-commerce

## Milestone

[깃헙 마일스톤 링크](https://github.com/anniemon/e-commerce/milestones?direction=asc&sort=due_date&state=open)

## Sequence Diagram

### 포인트 충전
```mermaid
sequenceDiagram
    participant Client as 클라이언트
    participant Service as 포인트 충전 서비스
    participant DB as 데이터베이스

    Client->>Service: 사용자 식별자와 충전할 금액을 전송
    Service->>DB: 사용자 유효성 검증 요청
    DB-->>Service: 유효한 사용자 확인

    alt 유효한 사용자일 경우
        Service->>DB: 잔액 증가 요청
        alt 잔액 증가 성공
            Service->>DB: 포인트 거래 히스토리 생성 (충전 타입)
            DB-->>Service: 거래 히스토리 생성 성공
            Service-->>Client: 포인트 충전 성공 응답
        else 잔액 증가 실패
            loop 최대 3회 재시도
                Service->>DB: 잔액 증가 재시도
                DB-->>Service: 잔액 증가 실패
            end
            Service-->>Client: 포인트 충전 실패 응답 (최종 실패)
        end
    else 유효하지 않은 사용자일 경우
        Service-->>Client: 유효하지 않은 사용자 에러 반환
    end
```

### 포인트 조회
```mermaid
sequenceDiagram
    participant Client as 클라이언트
    participant Service as 포인트 조회 서비스
    participant DB as 데이터베이스

    Client->>Service: 사용자 식별자로 잔액 조회 요청
    Service->>DB: 사용자 유효성 검증 요청
    DB-->>Service: 유효한 사용자 확인

    alt 유효한 사용자일 경우
        Service->>DB: 사용자 잔액 데이터 요청
        DB-->>Service: 사용자 잔액 데이터 반환
        Service-->>Client: 잔액 데이터 반환
    else 유효하지 않은 사용자일 경우
        Service-->>Client: 유효하지 않은 사용자 에러 반환
    end
```

### 상품 조회
```mermaid
sequenceDiagram
    participant Client as 클라이언트
    participant Service as 상품 조회 서비스
    participant DB as 데이터베이스

    Client->>Service: 상품 조회 요청 (상품 ID)
    
    Note right of Service: 상품 유효성 검사
    Service->>DB: 상품 유효성 검사 요청 (상품 ID)
    alt 유효하지 않은 상품
        DB-->>Service: 에러 반환 (유효하지 않은 상품)
        Service-->>Client: 에러 반환 (유효하지 않은 상품)
    else 유효한 상품
        Service-->>Client: 상품 정보 반환 (ID, 이름, 가격, 잔여 수량)
    end
```

### 상품 주문
```mermaid
sequenceDiagram
    participant Client as 클라이언트
    participant OrderService as 상품 주문 서비스
    participant DB as 데이터베이스
    
    Client->>OrderService: 사용자 식별자와 상품 ID 수량으로 주문 요청
    OrderService->>DB: 사용자 유효성 검증 요청
    alt 유효하지 않은 사용자
        DB-->>OrderService: 유효하지 않은 사용자 에러
        OrderService-->>Client: 에러 반환 (유효하지 않은 사용자)
    else 유효한 사용자
        Note right of OrderService: 포인트 검증
        OrderService->>DB: 포인트 검증 요청
        alt 포인트 부족
            DB-->>OrderService: 포인트 부족 에러
            OrderService-->>Client: 에러 반환 (포인트 부족)
        else 포인트 충분
            OrderService->>DB: 상품 재고 검증 (상품 ID, 수량)
            alt 재고 부족
                DB-->>OrderService: 재고 부족 에러
                OrderService-->>Client: 에러 반환 (재고 부족)
            else 재고 충분
                Note right of OrderService: 결제 요청
                OrderService->>DB: 결제 요청 (상품 가격 * 수량)
                alt 결제 실패
                    loop 최대 3회 재시도
                        OrderService->>DB: 결제 재시도
                        DB-->>OrderService: 결제 실패
                    end
                    OrderService-->>Client: 에러 반환 (결제 실패)
                else 결제 성공
                    Note right of OrderService: 수량 차감 및 포인트 차감
                    OrderService->>DB: 상품 잔여 수량 차감 (상품 ID, 수량)
                    DB-->>OrderService: 수량 차감 완료

                    OrderService->>DB: 사용자 포인트 차감
                    DB-->>OrderService: 포인트 차감 완료

                    OrderService-->>Client: 주문 성공 응답
                end
            end
        end
    end
```

### 상위 상품 조회
```mermaid
sequenceDiagram
    participant Client as 클라이언트
    participant ProductService as 상위 상품 조회 서비스
    participant DB as 데이터베이스
    participant Cache as 캐시

    Client->>ProductService: 최근 3일간 판매 상위 5개 상품 조회 요청
    ProductService->>Cache: 캐시 조회 (상위 5개 상품)
    alt 캐시 히트
        Cache-->>ProductService: 캐시된 데이터 반환
    else 캐시 미스
        ProductService->>DB: 최근 3일간 판매 상위 5개 상품 데이터 조회
        DB-->>ProductService: 상위 5개 상품 데이터 반환
        ProductService->>Cache: 캐시 저장 (상위 5개 상품 데이터)
    end
    ProductService-->>Client: 상위 5개 상품 데이터 반환
```

### 장바구니에 상품 추가
```mermaid
sequenceDiagram
    participant Client as 클라이언트
    participant CartService as 장바구니 서비스
    participant DB as 데이터베이스

    Client->>CartService: 사용자 식별자와 상품 + 수량으로 장바구니에 추가 요청 (상품 ID, 수량)
    
    Note right of CartService: 사용자 유효성 검증
    CartService->>DB: 사용자 유효성 검증 (사용자 ID)
    alt 유효하지 않은 사용자
        DB-->>CartService: 에러 반환 (유효하지 않은 사용자)
        CartService-->>Client: 에러 반환 (유효하지 않은 사용자)
    else 유효한 사용자
        Note right of CartService: 상품 및 재고 검증
        CartService->>DB: 상품 유효성 및 재고 검증 (상품 ID, 수량)
        alt 유효하지 않은 상품
            DB-->>CartService: 에러 반환 (유효하지 않은 상품)
            CartService-->>Client: 에러 반환 (유효하지 않은 상품)
        else 유효한 상품
            alt 재고 부족
                DB-->>CartService: 에러 반환 (재고 부족)
                CartService-->>Client: 에러 반환 (재고 부족)
            else 재고 충분
                Note right of CartService: 장바구니에 상품 추가
                CartService->>DB: 장바구니에 상품 추가 (상품 ID, 수량)
                DB-->>CartService: 추가 성공
                CartService-->>Client: 장바구니 추가 성공 응답
            end
        end
    end
```

### 장바구니에 상품 삭제
```mermaid
sequenceDiagram
    participant Client as 클라이언트
    participant CartService as 장바구니 서비스
    participant DB as 데이터베이스

    Client->>CartService: 사용자 식별자와 상품 + 수량으로 장바구니에 삭제 요청 (상품 ID, 삭제할 수량)
    
    Note right of CartService: 사용자 유효성 검증
    CartService->>DB: 사용자 유효성 검증 (사용자 ID)
    alt 유효하지 않은 사용자
        DB-->>CartService: 에러 반환 (유효하지 않은 사용자)
        CartService-->>Client: 에러 반환 (유효하지 않은 사용자)
    else 유효한 사용자
        Note right of CartService: 상품 유효성 검증
        CartService->>DB: 상품 유효성 검증 (상품 ID)
        alt 유효하지 않은 상품
            DB-->>CartService: 에러 반환 (유효하지 않은 상품)
            CartService-->>Client: 에러 반환 (유효하지 않은 상품)
        else 유효한 상품
            Note right of CartService: 장바구니에 담긴 상품 수량 검증
            CartService->>DB: 장바구니 상품 수량 검증 (상품 ID)
            alt 장바구니 상품 수량 검증 실패
                DB-->>CartService: 에러 반환 (장바구니 상품 수량 부족)
                CartService-->>Client: 에러 반환 (수량 부족)
            else 장바구니 상품 수량 검증 성공                
                Note right of CartService: 장바구니에서 상품 차감
                CartService->>DB: 장바구니에서 상품 수량 차감 (상품 ID, 삭제할 수량)
                DB-->>CartService: 삭제 성공
                CartService-->>Client: 상품 삭제 성공 응답
            end
        end
    end
```

### 장바구니 조회
```mermaid
sequenceDiagram
    participant Client as 클라이언트
    participant CartService as 장바구니 조회 서비스
    participant DB as 데이터베이스

    Client->>CartService: 사용자 식별자로 장바구니 조회 요청 (사용자 ID, 장바구니 ID)
    
    Note right of CartService: 사용자 유효성 검증
    CartService->>DB: 사용자 유효성 검증 (사용자 ID)
    alt 유효하지 않은 사용자
        DB-->>CartService: 에러 반환 (유효하지 않은 사용자)
        CartService-->>Client: 에러 반환 (유효하지 않은 사용자)
    else 유효한 사용자
        Note right of CartService: 장바구니 유효성 검증
        CartService->>DB: 장바구니 유효성 검증 (장바구니 ID)
        alt 유효하지 않은 장바구니
            DB-->>CartService: 에러 반환 (유효하지 않은 장바구니)
            CartService-->>Client: 에러 반환 (유효하지 않은 장바구니)
        else 유효한 장바구니
            Note right of CartService: 장바구니 상품 조회
            CartService->>DB: 장바구니에 담긴 상품과 수량 조회
            DB-->>CartService: 상품과 수량 데이터 반환
            CartService-->>Client: 장바구니 상품과 수량 반환
        end
    end
```

## API docs

WIP..

## ERD
[dbdiagram.io 링크](https://dbdiagram.io/d/E-commerce-670811e697a66db9a393b7dc)
![E-commerce (7)](https://github.com/user-attachments/assets/5dc5d803-b152-438c-a9ba-2c0af73fb7c6)

## Structure/Architecture

## Stack
- TypeScript + NestJS + TypeORM + MySQL + Redis
