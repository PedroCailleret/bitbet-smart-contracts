/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BytesLike,
  BigNumberish,
  Overrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  Payment,
  PaymentInterface,
} from "../../../contracts/PaymentsSolDec082022.sol/Payment";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_dalyWithdrawalLimit",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "_publicKey",
        type: "bytes",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "userId",
        type: "uint256",
      },
    ],
    name: "Deposited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
    ],
    name: "ERC20Deposited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
    ],
    name: "ERC20Withdraw",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "recovered",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum ECDSAVerificator.ErrorType",
        name: "errorType",
        type: "uint8",
      },
    ],
    name: "Validate",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "pubKey",
        type: "bytes",
      },
    ],
    name: "changePubKey",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "userId",
        type: "uint256",
      },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "currency",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "userid",
        type: "uint256",
      },
    ],
    name: "depositERC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPubKey",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountSeconds",
        type: "uint256",
      },
    ],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "resetWithdrawalLimit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "resume",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "currency",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "txid",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "currency",
        type: "uint8",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "txid",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "withdrawERC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60a060405260006002819055600381905562093a806004556007819055600855600980546001600160a01b0319908116732260fac5e5542a773aa44fbcfedf7c193bc2c59917909155600a805490911673a0b86991c6218b36c1d19d4a2e9eb0ce3606eb481790553480156200007457600080fd5b5060405162001e7638038062001e7683398101604081905262000097916200016e565b60016000553360805260058290556006829055600b620000b88282620002dd565b50600b604051620000ca9190620003a9565b604051908190039020600c80546001600160a01b0319166001600160a01b039092169182179055620001505760405162461bcd60e51b815260206004820152602560248201527f56616c69646174696f6e3a20496e76616c6964207265636f7665726564206164604482015264647265737360d81b606482015260840160405180910390fd5b505062000427565b634e487b7160e01b600052604160045260246000fd5b600080604083850312156200018257600080fd5b8251602080850151919350906001600160401b0380821115620001a457600080fd5b818601915086601f830112620001b957600080fd5b815181811115620001ce57620001ce62000158565b604051601f8201601f19908116603f01168101908382118183101715620001f957620001f962000158565b8160405282815289868487010111156200021257600080fd5b600093505b8284101562000236578484018601518185018701529285019262000217565b60008684830101528096505050505050509250929050565b600181811c908216806200026357607f821691505b6020821081036200028457634e487b7160e01b600052602260045260246000fd5b50919050565b601f821115620002d857600081815260208120601f850160051c81016020861015620002b35750805b601f850160051c820191505b81811015620002d457828155600101620002bf565b5050505b505050565b81516001600160401b03811115620002f957620002f962000158565b62000311816200030a84546200024e565b846200028a565b602080601f831160018114620003495760008415620003305750858301515b600019600386901b1c1916600185901b178555620002d4565b600085815260208120601f198616915b828110156200037a5788860151825594840194600190910190840162000359565b5085821015620003995787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b6000808354620003b9816200024e565b60018281168015620003d45760018114620003ea576200041b565b60ff19841687528215158302870194506200041b565b8760005260208060002060005b85811015620004125781548a820152908401908201620003f7565b50505082870194505b50929695505050505050565b608051611a2562000451600039600081816101db0152818161051901526105710152611a256000f3fe6080604052600436106100b15760003560e01c80638b93f54511610069578063b6b55f251161004e578063b6b55f251461017d578063b70f307c14610190578063c1678cd8146101b057600080fd5b80638b93f545146101485780639c9de1b71461016857600080fd5b806312065fe01161009a57806312065fe0146100e0578063136439dd146101005780634ad02ef11461012057600080fd5b8063046f7da2146100b657806311bd1621146100cd575b600080fd5b3480156100c257600080fd5b506100cb6101d0565b005b6100cb6100db3660046115f5565b61020c565b3480156100ec57600080fd5b506040514781526020015b60405180910390f35b34801561010c57600080fd5b506100cb61011b36600461166f565b61050e565b34801561012c57600080fd5b50600c546040516001600160a01b0390911681526020016100f7565b34801561015457600080fd5b506100cb610163366004611688565b610566565b34801561017457600080fd5b506100cb61064a565b6100cb61018b36600461166f565b610672565b34801561019c57600080fd5b506100cb6101ab3660046116bd565b61075e565b3480156101bc57600080fd5b506100cb6101cb366004611701565b61083d565b336001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000161461020557600080fd5b6000600255565b4260045460025461021d91906117a3565b1061026f5760405162461bcd60e51b815260206004820152601260248201527f436f6e747261637420697320706175736564000000000000000000000000000060448201526064015b60405180910390fd5b6003805490600061027f836117b6565b919050555084600354116102d55760405162461bcd60e51b815260206004820152600e60248201527f4e6f6e636520746f6f20686967680000000000000000000000000000000000006044820152606401610266565b8260ff166001146103745760405162461bcd60e51b815260206004820152605160248201527f43757272656e6379206d757374206265204554482c20696620796f752077616e60448201527f7420746f206d616b65204552433230207769746864726177207573652077697460648201527f68647261774552432066756e6374696f6e000000000000000000000000000000608482015260a401610266565b854710156103ea5760405162461bcd60e51b815260206004820152602e60248201527f436f6e747261637420646f65736e2774206861766520656e6f7567682066756e60448201527f647320746f2077697468647261770000000000000000000000000000000000006064820152608401610266565b6103f8868685858886610aa4565b60006104048488610d32565b9050806005600082825461041891906117d0565b9091555050604080516001600160a01b0387168152602081018990527f884edad9ce6fa2440d8a54cc123490eb96d2768479d49ff9c7366125a9424364910160405180910390a1426008556040516000906001600160a01b0387169089908381818185875af1925050503d80600081146104ae576040519150601f19603f3d011682016040523d82523d6000602084013e6104b3565b606091505b50509050806105045760405162461bcd60e51b815260206004820152601a60248201527f4572726f72206d616b696e672061207472616e73616374696f6e0000000000006044820152606401610266565b5050505050505050565b336001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000161461054357600080fd5b4260025562093a8081111561055757600080fd5b80156105635760048190555b50565b336001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000161461059b57600080fd5b4260085462ed4e006105ad91906117a3565b11156105b857600080fd5b805160208201206001600160a01b031661063a5760405162461bcd60e51b815260206004820152602560248201527f56616c69646174696f6e3a20496e76616c6964207265636f766572656420616460448201527f64726573730000000000000000000000000000000000000000000000000000006064820152608401610266565b600b610646828261186b565b5050565b426007546201518061065c91906117a3565b1061066657600080fd5b60065460055542600755565b4260045460025461068391906117a3565b106106d05760405162461bcd60e51b815260206004820152601260248201527f436f6e74726163742069732070617573656400000000000000000000000000006044820152606401610266565b600081116107205760405162461bcd60e51b815260206004820152601e60248201527f55736572204944206d7573742062652067726561746572207468616e203000006044820152606401610266565b604080513481526020810183905233917f73a19dd210f1a7f902193214c0ee91dd35ee5b4d920cba8d519eca65a7b488ca910160405180910390a250565b4260045460025461076f91906117a3565b106107bc5760405162461bcd60e51b815260206004820152601260248201527f436f6e74726163742069732070617573656400000000000000000000000000006044820152606401610266565b6107c4610e79565b6107ce8383610ed2565b826107e46001600160a01b038216333088610f38565b60408051338152602081018790526001600160a01b0386168183015290517f10210aba465589e42fd8145472c6bbce9f47079ffa6fe89f5c6e741fae43bcea9181900360600190a1506108376001600055565b50505050565b4260045460025461084e91906117a3565b1061089b5760405162461bcd60e51b815260206004820152601260248201527f436f6e74726163742069732070617573656400000000000000000000000000006044820152606401610266565b600380549060006108ab836117b6565b919050555085600354116109015760405162461bcd60e51b815260206004820152600e60248201527f4e6f6e636520746f6f20686967680000000000000000000000000000000000006044820152606401610266565b61090b8585610ed2565b6040517f70a08231000000000000000000000000000000000000000000000000000000008152306004820152859088906001600160a01b038316906370a0823190602401602060405180830381865afa15801561096c573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610990919061192b565b1015610a045760405162461bcd60e51b815260206004820152602e60248201527f436f6e747261637420646f65736e2774206861766520656e6f7567682066756e60448201527f647320746f2077697468647261770000000000000000000000000000000000006064820152608401610266565b610a12888887868887610aa4565b6000610a1e868a610d32565b9050610a346001600160a01b038316868b610fe9565b8060056000828254610a4691906117d0565b9091555050604080516001600160a01b038781168252602082018c905289168183015290517ff6ec5aa090c5e0f965cb680d7b2bb31073063aa12e87945c18f82b616f8b00509181900360600190a150504260085550505050505050565b60008581526001602052604090205460ff1615610b035760405162461bcd60e51b815260206004820152600e60248201527f4e6f6e6365206578697374656e740000000000000000000000000000000000006044820152606401610266565b600085815260016020818152604080842080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001690931790925581518082018a905280830189905260f888901b7fff00000000000000000000000000000000000000000000000000000000000000166060808301919091526061820188905286901b7fffffffffffffffffffffffffffffffffffffffff000000000000000000000000166081820152825180820360750181526095820184528051908301207f19457468657265756d205369676e6564204d6573736167653a0a33320000000060b583015260d18083018290528451808403909101815260f190920190935280519101209091908190610c178186611037565b90935091506000826004811115610c3057610c30611944565b14610c7d5760405162461bcd60e51b815260206004820181905260248201527f56616c69646174696f6e203a20566572696669636174696f6e206661696c65646044820152606401610266565b600c546001600160a01b03848116911614610d265760405162461bcd60e51b815260206004820152604b60248201527f56616c69646174696f6e203a205265636f76657265642061646472657373206460448201527f6f6573206e6f74206d61746368207769746820746865207075626c6963206b6560648201527f7927732061646472657373000000000000000000000000000000000000000000608482015260a401610266565b50505050505050505050565b60008260ff16600003610d9857816005541015610d915760405162461bcd60e51b815260206004820152601660248201527f4572726f72207769746864726177616c206c696d6974000000000000000000006044820152606401610266565b5080610e73565b8260ff16600103610e125764174876e8006000610db5828561195a565b9050806005541015610e095760405162461bcd60e51b815260206004820152601660248201527f4572726f72207769746864726177616c206c696d6974000000000000000000006044820152606401610266565b9150610e739050565b8260ff16600203610e2b5760646000610db5828561195a565b60405162461bcd60e51b815260206004820152601860248201527f496e636f72726563742063757272656e63792076616c756500000000000000006044820152606401610266565b92915050565b600260005403610ecb5760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c006044820152606401610266565b6002600055565b60ff81161580610ee557508060ff166002145b610eee57600080fd5b8060ff16600003610f13576009546001600160a01b0383811691161461064657600080fd5b8060ff1660020361064657600a546001600160a01b0383811691161461064657600080fd5b6040516001600160a01b03808516602483015283166044820152606481018290526108379085907f23b872dd00000000000000000000000000000000000000000000000000000000906084015b60408051601f198184030181529190526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fffffffff0000000000000000000000000000000000000000000000000000000090931692909217909152611299565b6040516001600160a01b0383166024820152604481018290526110329084907fa9059cbb0000000000000000000000000000000000000000000000000000000090606401610f85565b505050565b60008082516041036111495760208301516040840151606085015160001a7f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a082111561108d576000600494509450505050611292565b8060ff16601b141580156110a557508060ff16601c14155b156110ba576000600394509450505050611292565b604080516000808252602082018084528a905260ff841692820192909252606081018590526080810184905260019060a0016020604051602081039080840390855afa15801561110e573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b03811661113a57600060019550955050505050611292565b94506000935061129292505050565b825160400361128a57602083015160408401517f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8116600061119060ff84901c601b6117a3565b90507f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a08211156111cb57600060049550955050505050611292565b8060ff16601b141580156111e357508060ff16601c14155b156111f957600060039550955050505050611292565b604080516000808252602082018084528b905260ff841692820192909252606081018690526080810184905260019060a0016020604051602081039080840390855afa15801561124d573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b03811661127a5760006001965096505050505050611292565b9550600094506112929350505050565b506000905060025b9250929050565b60006112ee826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b031661137e9092919063ffffffff16565b805190915015611032578080602001905181019061130c919061197c565b6110325760405162461bcd60e51b815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e60448201527f6f742073756363656564000000000000000000000000000000000000000000006064820152608401610266565b606061138d8484600085611395565b949350505050565b60608247101561140d5760405162461bcd60e51b815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f60448201527f722063616c6c00000000000000000000000000000000000000000000000000006064820152608401610266565b600080866001600160a01b0316858760405161142991906119c9565b60006040518083038185875af1925050503d8060008114611466576040519150601f19603f3d011682016040523d82523d6000602084013e61146b565b606091505b509150915061147c87838387611487565b979650505050505050565b606083156114f65782516000036114ef576001600160a01b0385163b6114ef5760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000006044820152606401610266565b508161138d565b61138d838381511561150b5781518083602001fd5b8060405162461bcd60e51b815260040161026691906119e5565b80356001600160a01b038116811461153c57600080fd5b919050565b803560ff8116811461153c57600080fd5b634e487b7160e01b600052604160045260246000fd5b600082601f83011261157957600080fd5b813567ffffffffffffffff8082111561159457611594611552565b604051601f8301601f19908116603f011681019082821181831017156115bc576115bc611552565b816040528381528660208588010111156115d557600080fd5b836020870160208301376000602085830101528094505050505092915050565b60008060008060008060c0878903121561160e57600080fd5b863595506020870135945061162560408801611525565b935061163360608801611541565b92506080870135915060a087013567ffffffffffffffff81111561165657600080fd5b61166289828a01611568565b9150509295509295509295565b60006020828403121561168157600080fd5b5035919050565b60006020828403121561169a57600080fd5b813567ffffffffffffffff8111156116b157600080fd5b61138d84828501611568565b600080600080608085870312156116d357600080fd5b843593506116e360208601611525565b92506116f160408601611541565b9396929550929360600135925050565b600080600080600080600060e0888a03121561171c57600080fd5b873596506020880135955061173360408901611525565b945061174160608901611541565b935061174f60808901611525565b925060a0880135915060c088013567ffffffffffffffff81111561177257600080fd5b61177e8a828b01611568565b91505092959891949750929550565b634e487b7160e01b600052601160045260246000fd5b80820180821115610e7357610e7361178d565b600060001982036117c9576117c961178d565b5060010190565b81810381811115610e7357610e7361178d565b600181811c908216806117f757607f821691505b60208210810361181757634e487b7160e01b600052602260045260246000fd5b50919050565b601f82111561103257600081815260208120601f850160051c810160208610156118445750805b601f850160051c820191505b8181101561186357828155600101611850565b505050505050565b815167ffffffffffffffff81111561188557611885611552565b6118998161189384546117e3565b8461181d565b602080601f8311600181146118ce57600084156118b65750858301515b600019600386901b1c1916600185901b178555611863565b600085815260208120601f198616915b828110156118fd578886015182559484019460019091019084016118de565b508582101561191b5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b60006020828403121561193d57600080fd5b5051919050565b634e487b7160e01b600052602160045260246000fd5b60008261197757634e487b7160e01b600052601260045260246000fd5b500490565b60006020828403121561198e57600080fd5b8151801515811461199e57600080fd5b9392505050565b60005b838110156119c05781810151838201526020016119a8565b50506000910152565b600082516119db8184602087016119a5565b9190910192915050565b6020815260008251806020840152611a048160408501602087016119a5565b601f01601f1916919091016040019291505056fea164736f6c6343000811000a";

type PaymentConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: PaymentConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Payment__factory extends ContractFactory {
  constructor(...args: PaymentConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _dalyWithdrawalLimit: PromiseOrValue<BigNumberish>,
    _publicKey: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Payment> {
    return super.deploy(
      _dalyWithdrawalLimit,
      _publicKey,
      overrides || {}
    ) as Promise<Payment>;
  }
  override getDeployTransaction(
    _dalyWithdrawalLimit: PromiseOrValue<BigNumberish>,
    _publicKey: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _dalyWithdrawalLimit,
      _publicKey,
      overrides || {}
    );
  }
  override attach(address: string): Payment {
    return super.attach(address) as Payment;
  }
  override connect(signer: Signer): Payment__factory {
    return super.connect(signer) as Payment__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PaymentInterface {
    return new utils.Interface(_abi) as PaymentInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Payment {
    return new Contract(address, _abi, signerOrProvider) as Payment;
  }
}
