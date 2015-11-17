define([],function(){



function Fisher(){

	var self = this;


	var _storeFact = [0,0];
	var factorialLog = function(x){
			if (_storeFact[x] !== undefined){
				return _storeFact[x];
			} else {
				var start = _storeFact.length - 1;
				for (i = start; i < x; i++){
					_storeFact.push(_storeFact[i] + Math.log(i+1));
				}
			}
			return _storeFact[x];
		}


	self.fisherExact_Right = function(contA, contB, contC, contD){
			//Calculate RIGHT-SIDED FISHER EXACT
			var numerator, denominator, p = 0;
			var min = (contC < contB) ? contC : contB;
			var q;
			if (contA === 0){
				return 1;
			}

			for (q = 0; q < min + 1; q++){ 
				numerator  = factorialLog(contA + contB) + factorialLog(contC + contD) 
									+ factorialLog(contA + contC)+ factorialLog(contB + contD);

				denominator = factorialLog(contA) + factorialLog(contB) + factorialLog(contC) 
									+ factorialLog(contD) + factorialLog(contA + contB + contC + contD);
				p += Math.exp(numerator - denominator);
				
				contA += 1
				contB -= 1
				contC -= 1
				contD += 1
			
			}
			return p;
		}

	}


return Fisher;

});
