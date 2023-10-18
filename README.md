# Desafío: Operaciones cross-chain para el lanzamiento de un token y colección NFT

![diagram dapp](https://github.com/Blockchain-Bites/solidity-book/assets/3300958/8c52b351-5b23-4356-9747-a89cdc19c8ec)

Estás a punto de lanzar una colección de activos digitales en la red más popular para NFTs: Polygon (`Mumbai`). Para lograr ello se usará un contrato que implementa el estándar ERC721 con una cantidad de 2000 NFTs. Las estrategias para acuñación incluyen airdrop con lista blanca y compra directa.

Ethereum es la red más líquida en términos financieros. Hasta el día de hoy tiene el más alto total valor capturado (total value locked - TVL) en comparación con otros Blockchain. Tus clientes poseen sus dólares cripto (`USDC`) aquí. Dicha razón te motivó a crear una capa intermedia para poder realizar operaciones cross-chain.

Como parte de este lanzamiento, decidiste crear tu propio token llamado `BBites Token - BBTKN`. Lograr que este token adquiera un valor con el tiempo será clave para darle sostenibilidad al proyecto. Por eso decidiste que este token jugará un papel crucial al momento de adquirir los NFTs.

Una porción de los NFTs podrán ser comprados directamente en Ethereum (`Goerli`). Dado que el contrato de compra y venta de NFTs (`Public Sale`) solo recibe los tokens `BBTKN` y el usuario posee `USDC`, es necesario la creación de un pool de liquidez en Uniswap V2. Así, los compradores podrán intercambiar `USDC` por `BBTKN` y comprar los NFTs. También existe la modalidad de pagar directamente en `USDC` y dejar al contrato `Public Sale` que realice el swap internamente antes de comprar el NFT usando `BBTKN`.

## Estrategias de acuñación de NFTs

Existen tres maneras de adquirir los activos digitales y son las siguientes:

1. **Usando `BBTKN` o `USDC`**: Las compradores pueden dirigirse al contrato de compra y venta de NFTs (`Public Sale`) en la red Ethereum (`Goerli`) y usar los tokens `BBTKN` o `USDC` para adquirir NFTs. Los únicos tokens a la venta en esta modalidad van del id `0` al `699` (inclusivo) y tienen diferentes rangos de precio. Los tokens `BBTKN` se deducen de la billeterá del comprador y se transfieren al contrato `Public Sale`. Se dispara un evento para que en Mumbai sea acuñado el NFT con el id que acaba de ser comprado. Si se usa `USDC` para pagar, internamente el contrato `Public Sale` primero convierte el `USDC` a una cantidad exacta de `BBTKN` (usando Uniswap) para pagar por el NFT.
2. **Usando `ether`**: Los tokens que van del id `700` al `999` (inclusivo) pueden ser comprados depositando `0.01` ether al contrato de `Public Sale`. Si el usuario llama al método `purchaseWithEtherAndId(uint256 _id) public` del contrato `Public Sale`, el usuario puede comprar dicho _id del rango mencionado si está disponible. Sin embargo, el usuario también puede optar por enviar `ether` a `Public Sale` sin ejecutar ningún metodo. En dicho caso, de manera aleatoria el contrato escoge un id disponible en el rango `700` a `999` (inclusivo). Este id que es adquirido mediante `ether` se envía en un evento a la red Polygon (`Mumbai`) para que se acuñe dicho NFT.
3. **Usando una lista blanca**: Los usuarios en la lista blanca pueden dirigirse a Polygon (`Mumbai`) e interactuar con el contrato de NFTs para acuñar y saltarse el paso del pago en Ethereum (`Goerli`). Se han seleccionado 1000 billeteras para que cada una pueda acuñar un id en específico. El rango de id para esta modalidad va del `1000` al `1999`. Puedes revisar las billeteras  que irán en la lista blanca en el archivo `./wallets/walletList.js`.

## NFT Buy Back y quema de NFTs

Tu proyecto ofrece la oportunidad recomprar los NFTs cuyos ids fueron parte de la lista blanca (no importa si el dueño ya no lo es). Estos usuarios pueden acercarse al contrato de NFTs en Polygon (`Mumbai`) y quemar su NFT usando el método `buyBack(uint256 id) public` y recibir una compensación. Al quemarse el NFT, se emite el evento `Burn(address account, uint256 id)` que finalmente, cross-chain, dispara una acuñación de `10,000 BBTKN` en Ethereum (`Goerli`). De esta manera, tu proyecto propicia la deflación de los activos digitales.

## Arquitectura de la aplicación

Para asegurar la conveniencia del usuario y éxito de tu proyecto, has creado una arquitectura de contratos y middleware (Open Zeppelin Defender) que consta de las siguientes partes:

1. Token ERC20 (llamado `BBites Token - BBTKN`)
2. NFT ERC721 (usar coleccion de 2000 cuyes)
3. Contrato de compra y venta (`Public Sale`)
4. `USDC` (stable coin)
5. Open Zeppelin Defender (Middleware)
   * `Goerli` => `Mumbai`
   * `Mumbai` => `Goerli`
6. IPFS
7. Pool de liquidez (par: `USDC` y `BBites Token` - UNISWAP V2)
8. Front-end

## Contratos para cada chain

| Ethereum (`Goerli`)                         | Polygon (`Mumbai`) |
| ------------------------------------------- | ------------------ |
| `BBites Token` ERC20, `USDC`, `Public Sale` | `NFT ERC721`       |

## Contratos actualizables:

| Actualizables                                      | No Actualizables |
| -------------------------------------------------- | ---------------- |
| `BBites Token` ERC20, `NFT ERC721` y `Public Sale` | `USDC`           |

## Descripción de la Arquitectura

### 1 - `BBites Token - BBTKN`

* Este contrato es un ERC20 que debe ser convertido a actualizable. Posee 18 decimales. Es publicado en Ethereum (`Goerli`)

* En el método `initialize()`, usando `_mint()` se acuña 1 millón de tokens al que publica el contrato. Ese millón será utilizado para crear el pool de liquidez junto al USDC. 

* Posee un método `mint(address to, uint256 amount) onlyRole(MINTER_ROLE)` que solo es llamado por el `Relayer` de Open Zeppelin. Este método es disparado cuando desde Polygon (`Mumbai`) se quema un NFT cuyo id está entre `1000` y `1999` (inclusivo). Se acuña `10,000` tokens al `address` que quemó su NFT.

* Su método `mint` posee el modifier `whenNotPaused` para pausarse cuando sea necesario.

* **Bonus**: Implementar la extensión `ERC20Permit`. Aquellos compradores que no poseen gas para pagar la transacción crearán una firma digital para poner al contrato de `Public Sale` como el gastador de sus tokens. Esta firma digital podrá ser generada desde el front-end usando Metamask.

  Una vez generada la firma, se llamará a un autotask desde el front-end pasando los parámetros necesarios (e.g. firma). Este autotask usará un relayer en `Goerli` y tendrá la tarea de llamar `executePermitAndPurchase() public onlyRole(EXECUTER_ROLE)` de `Public Sale`. Este método hace lo siguiente:

  * Ejecuta el método `permit()` del contrato ERC20Permit `BBToken` con todos sus parámetros (`owner`, `spender`, `value`, `deadline`, `v`, `r` y `s`)
  * Inmediatamente calcula un id aleatorio del tipo `mistico` (explicado más abajo) cuyos ids van del `700` al `999`.
  * Emite el evento `PurchaseNftWithId(owner, randomId)` 

  Reutiliza la misma función aleatoria para este tipo de NFT `mistico` (ver cuarta modalidad de compra en el contrato `Public Sale`).

### 2 - NFT ERC721 `CUY COLLECTION`

* Este contrato `Cuy Collection Nft` implementa el estándar ERC721 que debe ser convertido a actualizable.
* Posee el método `safeMint(address to, uint256 tokenId) public onlyRole(MINTER_ROLE)` que solo puede ser llamado por el `Relayer` de Open Zeppelin en `Mumbai`. Los ids permitidos van del `0` al `999` para este método. Lleva el modifier `whenNotPaused`.
* Posee el método `safeMintWhiteList(address to, uint256 tokenId, bytes32[] proofs) public` que será llamado por cada una de las 1000 billeteras de la lista blanca. Internamente este método valida que `to` y `tokenId` sean parte de la lista. Así también, se debe habilitar en el front-end una manera de solicitar las pruebas. Dado un `address` y un `uint256`, el front-end te entregará el array de pruebas a usarse como argumento de este método. Lleva `whenNotPaused`. Puede ser llamado por cualquiera.
* Posee el método `buyBack(uint256 id) public` que permite a los dueños de los ids en el rango de `1000` y `1999` (inclusivo) quemar sus NFTs a cambio de un repago de `BBTKN` en la red de Ethereum (`Goerli`). Este método emite el evento `Burn(address account, uint256 id)` que finalmente, cross-chain, dispara `mint()` en el token `BBTKN` en la cantidad de `10,000` BBTKNs.

### 3 - Contrato `Public Sale`

* Este contrato de `Public Sale` se publica en Ethereum (`Goerli`). Sirve como intermediario para poder realizar el pago para adquirir NFTs.

* La comunicación entre el contrato de `Public Sale` y el contrato de NFTs se dará a través de Open Zeppelin Defender. El contrato de `Public Sale` emite eventos que serán escuchados por Open Zeppelin Defender, que a su vez ordenará al contrato de NFT en Polygon (`Mumbai`) de acuñar un determinado NFT.

* Los ids para la venta usando `BBTKN` o `USDC` van del `0` hasta el `699` y tienen diferentes rangos de precio.

* Se puede enviar `0.01 ether` para comprar NFTs en el rango de `700 - 999`. 

* Los ids que van del `1000 - 1999` solo se acuñan en Polygon (`Mumbai`) en el mismo contrato de NFTs usando la lista blanca (merkle tree).

* La siguiente tabla resume la información de ids vs tips vs precios.

  | id (inclusivo) | Tipo       | Precio (`BBTKN`)           |
  | -------------- | ---------- | -------------------------- |
  | `0 - 199`      | Común      | `1000 BBTKN` fijo          |
  | `200 - 499`    | Raro       | Multiplicar su id por `20` |
  | `500 - 699`    | Legendario | Según días pasados*****    |
  | `700 - 999`    | Místico    | `0.01 ether` fijo          |
  | `1000 - 1999`  | Whitelist  | Sin precio                 |

  <u>*****Nota:</u> Su precio cambia según el # de días pasados desde las 00 horas del 30 de septiembre del 2023 GMT (obtener el timestamp en [epoch converter](https://www.epochconverter.com/)). El primer día empieza en `10,000 BBTKN`. Por cada día pasado, el precio se incrementa en `2,000 BBTKN`. El precio máximo es `90,000 BBTKN`.

* La primera manera de compra es usando los `BBTKN` tokens. El método a usar es `purchaseWithTokens(uint256 _id)` y el usuario escoge el id a comprar y se emite el evento. Estos tokens se transfieren al contrato `Public Sale`. Aplica para ids en el rango `0 - 699`.

* La segunda manera de compra es usando `USDC`. El método a usar es `purchaseWithUSDC(uint256 _id)` y el usuario escoge el id a comprar y se emite el evento. Internamente, en este método se usa el pool de liquidez para intercambiar los `USDC` por una cantidad exacta de `BBTKN`. Aplica para ids en el rango `0 - 699`.  Dado que no se sabe la cantidad de `USDC` a depositar, se sugiere dar el `approve` de un monto seguro por parte del usuario. Este método tiene que dar el vuelto del `USDC` que no se llegó a usar en la compra.

  **BONUS:** Para obtener un estimado de cuántos `USDC` se necesitan para comprar una cantidad exacta de `BBTKN`, revisar [getAmountIn](https://docs.uniswap.org/contracts/v2/reference/smart-contracts/library#getamountin) de Uniswap. El usuario, antes de comprar bajo este método, puede consultar `getAmountIn` y dar el `approve` en dicha cantidad de `USDC` estimada. Exponer `getAmountIn` en este contrato.

* La tercera manera de compra es enviando exactamente `0.01 ether` y ejecutando, al mismo tiempo, el método `purchaseWithEtherAndId(uint256 _id)`. El usuario escoge el id a comprar y se emite el evento. Aplica para ids en el rango `700 - 999`. El `ether` es acumulado en el mismo contrato `Public Sale`. Dar vuelto si se envía más de `0.01 ether`.

* La cuarta manera de compra es enviando exactamente `0.01 ether` al contrato sin ejecutar ningún metodo. Aleatoriamente se escoge un id de NFT que esté disponible y se emite el evento. Aplica para ids en el rango `700 - 999`. El `ether` es acumulado en el mismo contrato `Public Sale`.

* El evento que se emite luego de realizar cualquier compra tiena la siguiente forma: `event PurchaseNftWithId(address account, uint256 id)`.

* El método llamado `withdrawEther() public onlyRole(DEFAULT_ADMIN_ROLE)` permite a cualquier admin transferirse el `ether` que fue depositado a este contrato.

* El método llamado `withdrawTokens() public onlyRole(DEFAULT_ADMIN_ROLE)` permite a cualquier admin transferirse los tokens `BBTKN` que fueron depositados a este contrato.

* Construir un método de ayuda que devuelve el precio dado un id. Este método se llamará `getPriceForId(uint256 id) public view returns(uint256)`. Solo aplica para ids en el rango `0` y `699` (inclusivo).

### 4 - USDC

* Encontrarás una réplica del stable coin `USDC` en el repositorio. Al desplegarlo, el `msg.sender` se hace acreeder de `500,000 USDC`. Esta cantidad es usada para crear el pool de liquidez junto al `BBTKN`.
* Este contrato no es actualizable y se publica en Ethereum (`Goerli`)
* Inicialmente este contrato es de 18 decimales. Debes convertirlo a un token de 6 decimales como lo es el original `USDC`.
* Puedes repartir `USDC` a cualquier comprador para que simule la posesión de fondos. Normalmente, este stable coin es adquirido en DEXes como Binance, KuCoin y otros.

### 5 - Open Zeppelin Defender

**De Ethereum (`Goerli`) a Polygon (`Mumbai`)**:

* El sentinel (`Goerli`) escucha los eventos `PurchaseNftWithId` de `Public Sale`. El autotask ejecuta el script que acuña el NFT en Polygon (`Mumbai`) en el contrato de NFT. El relayer (`Mumbai`) será el único que puede firmar el método `safeMint()` del contrato NFT para acuñar el id a la billetera respectiva. El relayer debe tener el rol de `MINTER_ROLE` para poder acuñar.

**De Polygon (`Mumbai`)  a Ethereum (`Goerli`):**

* El sentinel (`Mumbai`) escucha los eventos `Burn` del contrato `NFT`. El autotask ejecuta el script que acuña `10,000 BBTKN` en `Goerli` en el contrato del token `BBTKN`. El relayer (`Goerli`) será el único que puede firmar el método `mint()` para acuñar `BBTKN` a la billetera respectiva. El relayer debe tener el rol de `MINTER_ROLE` para poder acuñar.

### 6 - IPFS

1. Dentro de la carpeta `ipfs` tenemos dos carpetas: `images` y `metadata`. Estas dos carpetas representan a los activos digitales y la metadata, respectivamente.
2. Guardar la carpeta de `images` de activos digitales en la aplicación de escritorio `IPFS`. Obtener el `CID` luego de guardar la carpeta `images`.
3. Dentro de la carpeta de `metadata`, se encontrarán los archivos `json` enumerados de manera secuencial. Cada archivo `json`, representa la metada de un activo digital en particular. Por ejemplo, el archivo `0`, representa la metadata del activo digital `0.png`, guardada en la otra carpeta `images`.
4. Vamos a modificar los archivos de `metadata`. Por ejemplo, empecemos con `./metadata/0`. Buscar la propiedad `"image": "ipfs://QmWJ3udcvB2XjvgWjcn8YrC7w8VEL2VWaUMq1x6Ns4t29k/0.png"`. Reemplazar por el valor del `CID` obtenido en el punto 2 para todos los archivos. Usa `ctrl + shift + h`.
5. Así también cambia la propiedad `description` y escoge un nombre apropiado para tu colección. Usa `ctrl + shift + h`.
6. (Opcional) Dado que hay cinco grupos diferentes de NFTs, modificar el atributo `name` de cada archivo `json` para que represente más apropiadamente al grupo de NFT al que pertenece.
7. (Opcional) Agregar más atributos en la propiedad `attributes`. Seguir la guía/estándar definido en la página de Open Sea que lo puedes encontrar [aquí](https://docs.opensea.io/docs/metadata-standards). Estos atributos serán vistos en la galería de Opean Sea.
8. Luego de terminar de editar los archivos de metadata, guardar la carpeta `metadata` en `ipfs` para poder obtener el `CID`.
9. Finalmente, este `CID` es el que se guardará en el smart contract de NFT en el método `_baseURI()`. Gracias a este método, el smart contract puede encontrar la metadata y el activo digital en el `IPFS`.

### 7 - Pool de liquidez (`USDC` y `BBTKN`)

* Se creará un pool de liquidez en Uniswap V2 usando los tokens `USDC` y `BBTKN`. Dicho pool estará conformado por 1 Millón de tokens `BBTKN` y medio millón del token `USDC`.
* Acuñar `100,000 USDC` a la siguiente billetera para propósitos de testing: `0xF90a9359f2422b6885c900091f2aCc93E0933B7a`.
* Desde el contrato de `Public Sale` se establecerá una comunicación con el `Router` de Uniswap para intercambio `USDC` por `BBTKN` y realizar la compra del NFT con su precio respectivo

### 8 - Front-end

Crear un front-end minimalista para poder interactuar con el contrato de `Public Sale` (ver video). En este front, se podrán realizar las siguientes operaciones:

#### Login

1. Botón conectar a Metamask
2. Ver cuenta conectada

#### Balances

3. Observar el Balance `USDC` de la billetera conectada
4. Observar el Balance `BBToken` de la billetera conectada

#### Approves (`USDC` y `BBToken`) en `Goerli`

5. Dar approve de `BBTKN` al contrato de `Public Sale`
6. Dar approve de `USDC` al contrato de `Public Sale`

#### Comprando NFTs en `Public Sale` en `Goerli`

7. Comprar un NFT usando el método `purchaseWithTokens`
8. Comprar un NFT usando el método `purchaseWithUSDC`
9. Comprar un NFT usando el método `purchaseWithEtherAndId`
10. Comprar un NFT enviando `ether` al contrato `Public Sale` sin ejecutar métodos
11. Consultar el precio de un NFT dado su id

#### Acuñando de whitelist en `NFT Contract` en `Mumbai`

12. Dados un `id` y `billetera`, consultar los `proofs` para el whitelist
13. Usando `billetera`, `token id` y `proofs`, acuñar NFT de whitelist
14. Ejecutar Buy Back quemando el NFT usando el `token id`

#### Eventos

15. Public Sale
    * PurchaseNftWithId
16. Bites Token
    * Transfer
17. NFT contract
    * Transfer
    * Burn

## Entregables

1. Token ERC20 `BBITES Token - BBTKN`
2. Contrato NFT `ERC721` con una colección de 2000 cuyes
3. Contrato de `Public Sale`
4. Stable Coin `USDC` ficticio
5. Autotask: `Goerli` a `Mumbai`. Incluye código en `goerliToMumbai.js`.
6. Autotask: `Mumbai` a `Goerli`. Incluye código en `mumbaiToGoerli.js`.
7. Pool de liquidez en Uniswap V2
8. Front-end con los métodos implementados del punto `8 - Front-end`
9. Testing con alta cobertura para `Public Sale`
10. Testing con alta cobertura para `ERC721`
11. Script de deployment para contratos en `Goerli`
12. Script de deployment para contratos en `Mumbai`

# Completar

1. Pega aquí la tx de una compra de un NFT `común` en `Public Sale` usando `UDSC`:
2. Pega aquí la tx de una compra de un NFT `raro` en `Public Sale` usando `BBTKN`:
3. Pega aquí la tx de una compra de un NFT `legendario` en `Public Sale` usando `UDSC`:
4. Pega aquí la tx de una compra de un NFT `mistico` en `Public Sale` usando `ether` y un `id` en específico:
5. Pega aquí la tx de una compra de un NFT `mistico` en `Public Sale` usando `ether` (random id):
6. Pega aquí la tx de una acuñación whitelist de un NFT en el contrato `NFT`:
7. Pega aquí la tx de un buy back de NFT en el contrato `NFT`:
