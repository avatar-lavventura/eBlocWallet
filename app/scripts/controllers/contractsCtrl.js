'use strict';
var contractsCtrl = function($scope, $sce, walletService) {
  $scope.ajaxReq = ajaxReq;
  $scope.visibility = "deployView";
  //$scope.sendContractModal = new Modal(document.getElementById('sendContract'));
  //$scope.sendContractModal.open();
  $scope.sendTxModal = new Modal(document.getElementById('sendTransaction'));
  $scope.tx = {
    gasLimit: '',
    data: '',
    to: '',
    unit: "ether",
    value: 0,
    nonce: null,
    gasPrice: null
  }
  $scope.Validator = Validator;
  $scope.showRaw = false;
  $scope.$watch(function() {
    if (walletService.wallet == null) return null;
    return walletService.wallet.getAddressString();
  }, function() {
    if (walletService.wallet == null) return;
    $scope.wallet = walletService.wallet;
  });
  $scope.$watch('tx', function(newValue, oldValue) {
    $scope.showRaw = false;
  }, true);
  $scope.$watch('[tx.data]', function() {
    if ($scope.Validator.isValidHex($scope.tx.data) && $scope.tx.data != '') {
      if ($scope.estimateTimer) clearTimeout($scope.estimateTimer);
      $scope.estimateTimer = setTimeout(function() {
        $scope.estimateGasLimit();
      }, 500);
    }
  }, true);
  $scope.estimateGasLimit = function() {
    var estObj = {
      from: globalFuncs.donateAddress,
      value: '0x00',
            data: ethFuncs.sanitizeHex($scope.tx.data)
        }
        ethFuncs.estimateGas(estObj, function(data) {
            if (!data.error) $scope.tx.gasLimit = data.data;
        });
  }
  $scope.generateTx = function() {
    try {
      if ($scope.wallet == null) throw globalFuncs.errorMsgs[3];
      else if (!ethFuncs.validateHexString($scope.tx.data)) throw globalFuncs.errorMsgs[9];
      else if (!globalFuncs.isNumeric($scope.tx.gasLimit) || parseFloat($scope.tx.gasLimit) <= 0) throw globalFuncs.errorMsgs[8];
      $scope.tx.data = ethFuncs.sanitizeHex($scope.tx.data);
      ajaxReq.getTransactionData($scope.wallet.getAddressString(), function(data) {
        if (data.error) throw data.msg;
        data = data.data;
        $scope.tx.to = '0xCONTRACT';
        $scope.tx.contractAddr = ethFuncs.getDeteministicContractAddress($scope.wallet.getAddressString(), data.nonce);
        var txData = uiFuncs.getTxData($scope);
        uiFuncs.generateTx(txData, function(rawTx) {
          if (!rawTx.isError) {
            $scope.rawTx = rawTx.rawTx;
            $scope.signedTx = rawTx.signedTx;
            $scope.sendTxStatus = $sce.trustAsHtml(globalFuncs.getDangerText(''));
            $scope.showRaw = true;
          } else {
            $scope.showRaw = false;
            $scope.sendTxStatus = $sce.trustAsHtml(globalFuncs.getDangerText(rawTx.error));
          }
        });
      });
    } catch (e) {
      $scope.deployContractStatus = $sce.trustAsHtml(globalFuncs.getDangerText(e));
    }
  }
  $scope.sendTx = function() {
    $scope.sendTxModal.close();
    uiFuncs.sendTx($scope.signedTx, function(resp) {
      if (!resp.isError) {
        $scope.sendTxStatus = $sce.trustAsHtml(globalFuncs.getSuccessText(globalFuncs.successMsgs[2] + "<br />" + resp.data + "<br /><a href='http://etherscan.io/tx/" + resp.data + "' target='_blank'> ETH TX via EtherScan.io </a> & Contract Address <a href='http://etherscan.io/address/" + $scope.tx.contractAddr + "' target='_blank'>" + $scope.tx.contractAddr + "</a>"));
      } else {
        $scope.sendTxStatus = $sce.trustAsHtml(globalFuncs.getDangerText(resp.error));
      }
    });
  }
  $scope.setVisibility = function(str) {
    $scope.visibility = str;
  }

}
module.exports = contractsCtrl;
