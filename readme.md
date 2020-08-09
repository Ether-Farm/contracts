## goerli

FETH: 0xa0Fb85Ce3D93DF300c607892b52383720Cd6770e

VOT: 0x4D3968Dc323340A8ef7De6e9d57B38858b1B425e

Farm: 0x47a678419E9D55b47b66600f45A601791947a4b4

PauseDeposit: 0x9E1fBB60e621C5c425E3797c1bfd629bccCdC045   (已投票)
              0xE9b1B43e48898eE01cC3E868a23aE55A4EF9b1Bd   (未投票)

CompoundDeposit: 0x67F6D1402de78C895f0D81d8a23c7ED97eB3ad0A （已投票）
                 0xC7aFf7c9e4e7CEDd169Dd657991C5BD778AcDE92  (未投票)
cETH: 0x20572e4c090f15667cf7378e16fad2ea0e2f3eff 

## Teset report
![](./coverage/testreport.jpg)

## Farm function

### 1. 投票通过提案 
```javascript
//proposal 提案合约地址 ps:投票率超过66%提案通过
function vote(address proposal) external nonReentrant returns (bool status, uint256 votes)
```

### 2. 投票结束提案
```javascript
//proposal 提案合约地址
function unActiveVot(address proposal) external
```

### 3. 当前提案数量
```javascript
//length 当前提案数量
function getProposalNumber() external view returns (uint256 length)
```

### 4. 根据索引读取提案
```javascript
//index 根据索引读取提按状态
function getProposalByIndex(uint256 index) external view returns (address proposal, bool status, uint256 votes, uint256 expired))
```

### 5. 根据提案地址读取提案
```javascript
///proposal 提案合约地址
function getProposal(address proposal) external view returns (bool status, uint256 votes, uint256 expired)
```

### 6. 投资
```javascript
//amountFETH 投入的FETH数量, 投资人通过暂停投资的提案后无法投资。需要等待开启投资的提案通过后才能继续投资
function deposit(uint256 amountFETH) external nonReentrant whenNotPaused returns (uint256 liquidity)
```
### 4. 提现
```javascript
//amountVOT 要提现的VOT数量
function withdraw(uint256 amountVOT) external nonReentrant returns (uint256 withdrawAmount)
```
## Proposal function 
```javascript
//合约状态是否激活
bool public status;
//合约提案请求的投资额
uint256 public INVEST_ETH = 11e15;
//合约提案摘要
string public SUMMARY = "proposal for deposit to compound";
```
通过compound投资提案：https://goerli.etherscan.io/tx/0x979d3ce8a35c115106f362bf36cd1ff6f87c1a126bb22f5b0eae03992faa2579

投票后被锁定无法马上再次投票：https://goerli.etherscan.io/tx/0x016a162f8a8af39292ea84a2e355b3ee9127d2e3c3bd351d9089a8e4dd867aec

关闭compound投资提案：https://goerli.etherscan.io/tx/0xace8c0c6a464689c37a081206b6e730bddf8261387828f930275a85a3846d1e4

