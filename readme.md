
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

    Client->>Service: 충전할 금액을 전송
    Service->>DB: jwt에서 사용자 ID를 가져와 사용자 유효성 검증 요청
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

    Client->>Service: 잔액 조회 요청
    Service->>DB: jwt에서 사용자 ID 가져와 사용자 유효성 검증 요청
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
    Service->>DB: 상품 정보 조회 요청 (상품 ID)
    DB-->>Service: 상품 정보 반환 (ID, 이름, 가격, 잔여 수량)
    Service-->>Client: 상품 정보 반환 (ID, 이름, 가격, 잔여 수량)
```

### 상품 주문
```mermaid
sequenceDiagram
    participant Client as 클라이언트
    participant OrderService as 주문 서비스
    participant PointService as 포인트 서비스
    participant ProductService as 상품 서비스
    participant PaymentService as 결제 서비스

    Client->>OrderService: 상품 주문 요청 (상품 ID, 수량)
    
    Note right of OrderService: 포인트 검증
    OrderService->>PointService: 사용자 포인트 검증 (상품 가격 * 수량)
    alt 포인트 부족
        PointService-->>OrderService: 포인트 부족 에러
        OrderService-->>Client: 에러 반환 (포인트 부족)
    else 포인트 충분
        PointService-->>OrderService: 포인트 검증 성공
    
        Note right of OrderService: 상품 재고 검증
        OrderService->>ProductService: 상품 재고 검증 (상품 ID, 수량)
        alt 재고 부족
            ProductService-->>OrderService: 재고 부족 에러
            OrderService-->>Client: 에러 반환 (재고 부족)
        else 재고 충분
            ProductService-->>OrderService: 재고 검증 성공

            Note right of OrderService: 결제 요청
            OrderService->>PaymentService: 결제 요청 (상품 가격 * 수량)
            alt 결제 실패
                loop 최대 3회 재시도
                    OrderService->>PaymentService: 결제 재시도
                    PaymentService-->>OrderService: 결제 실패
                end
                alt 최종 결제 실패
                    OrderService-->>Client: 에러 반환 (결제 실패)
                else 결제 성공
                    PaymentService-->>OrderService: 결제 성공
                    Note right of OrderService: 수량 차감 및 포인트 차감
                    OrderService->>ProductService: 상품 잔여 수량 차감
                    ProductService-->>OrderService: 수량 차감 완료

                    OrderService->>PointService: 사용자 포인트 차감
                    PointService-->>OrderService: 포인트 차감 완료

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

## Structure/Architecture

## Stack
- TypeScript + NestJS + TypeORM + MySQL
