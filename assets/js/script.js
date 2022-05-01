var inputData =  {};
var suggestionData = {};
var emptyValData = {};

//Document ready function
$(function() {
    //Dummmy notify messages
    /* $.notify("Notify Integrated", "success");
    $.notify("Notify Integrated", "error");
    $.notify("Notify Integrated", "warn");
    $.notify("Notify Integrated", "info"); */

    let inputDisableArr = ["bucketA", "bucketB", "bucketC", "bucketD", "bucketE", "pinkVolume", "redVolume", "blueVolume", "orangeVolume", "greenVolume"];

    //setting keys for inputData
    $("input").each(function(){
        let key = $(this).attr('id');
        let val = $(this).val();
        inputData[key] = val;

        if(localStorage.getItem('count') && inputDisableArr.includes(key)) {
            $(this).prop('disabled', true);
        }

        // Change Event on inputs param 
        $(this).on('change', function (){
            let key = $(this).attr('id');
            let val = $(this).val();

            inputData[key] = val;
            
            //remove old inputData
            localStorage.removeItem('inputData');

            //set updated inputData
            let inputDataString = JSON.stringify(inputData);
            localStorage.setItem('inputData', inputDataString);
        });
    });

    //Setting localStorage values in inputs 
    if(localStorage.getItem('inputData')) {
        inputData = JSON.parse(localStorage.getItem('inputData'));
        
        for (let key in inputData) {
            $(`#${key}`).val(inputData[key]);
        }
    } else {
        //Setting local storage for Inputs
        let inputDataString = JSON.stringify(inputData);
        localStorage.setItem('inputData', inputDataString);
    }
    
    
    //Checking for Empty Volume Data
    if(localStorage.getItem('emptyValData')) {
        emptyValData = JSON.parse(localStorage.getItem('emptyValData'));
    } 
    
    //Checking for Suggestion Data Data
    if(localStorage.getItem('suggestionData')) {
        suggestionData = JSON.parse(localStorage.getItem('suggestionData'));
        
        //Show Output Data
        showOutputData();
    }

    /* Clear All Inputs */
    $("#clearAll").click(function() {
        localStorage.clear();
   
        $("input").each(function() {
            $(this).val("");
            $(this).prop('disabled', false);
        });

        inputData = {};
        suggestionData = {};
        emptyValData = {};
        $('#suggestionBlock').html('');
        $('#emptyVolumeBlock').html('');
        
        $.notify("All Inputs Cleared Successfully!", "success");
    });

    /* Suggestion function */
    $("#suggestion").click(function() {
        //set count in locastorage if not exist
        let count = 0;
        //check for counter
        if(localStorage.getItem('count')) {
            count = localStorage.getItem('count');
            count = count + 1;
            localStorage.setItem('count', count);
        } else {
            //check for first click and  disabled bucket & Ball volumne inputs
            count = localStorage.setItem('count', 0);
            
            $("#bucketVolumeWrapper :input").each(function() {
                $(this).prop('disabled', true);
            });
    
            $("#ballVolumeWrapper :input").each(function() {
                $(this).prop('disabled', true);
            });
        }

        //setting Empty Volume Data
        if(Object.keys(emptyValData).length == 0){
            emptyValData = {
                'bucketA': inputData.bucketA,
                'bucketB': inputData.bucketB,
                'bucketC': inputData.bucketC,
                'bucketD': inputData.bucketD,
                'bucketE': inputData.bucketE
            };
            
            let emptyValDataString = JSON.stringify(emptyValData);
            localStorage.setItem('emptyValData', emptyValDataString);
        
        }

        // Logic for Get suggestions
        let bucketData = {};
        let ballVolData = {};
        let ballQtyData = {};
        let bucketBallCountData = {};

        $("#bucketVolumeWrapper :input").each(function() {
            let key = $(this).attr('id');
            bucketData[key] = inputData[key];
        });

        $("#ballVolumeWrapper :input").each(function() {
            let key = $(this).attr('id');
            ballVolData[key.replace("Volume", "")] = inputData[key];
        });

        $("#quantityWrapper :input").each(function() {
            let key = $(this).attr('id');
            ballQtyData[key.replace("Qty", "")] = inputData[key];
        });

        let hasData = false;

        for (let buketKey in bucketData) {
            bucketBallCountData[buketKey] = {};

            for (let ballKey in ballQtyData) {
                bucketBallCountData[buketKey][ballKey] = 0;
                let bucketBallCount = 0; 
                let qty = ballQtyData[ballKey];
                let vol = ballVolData[ballKey];

                for (let i = 0; i < ballQtyData[ballKey]; i++) {
                    if ((emptyValData[buketKey] - vol) > 0) {
                        bucketBallCount = bucketBallCount + 1;
                        emptyValData[buketKey] = emptyValData[buketKey] - vol;
                        qty--;
                        hasData = true;;
                    }
                }
                
                bucketBallCountData[buketKey][ballKey] = bucketBallCount;
                ballQtyData[ballKey] = qty;
            }
        }

        if(hasData == false) {
            $.notify("No More Space Left in Buckets", "warn");
            return false;   
        }

        if(localStorage.getItem('suggestionData')) {
            let count = localStorage.getItem('count');
            suggestionData = JSON.parse(localStorage.getItem('suggestionData'));
            suggestionData[count] = bucketBallCountData;
        } else {
            let count = localStorage.getItem('count');
            suggestionData[count] = bucketBallCountData;
        }

        //show data on page
        showOutputData();
        
        // Update local storage values 
        localStorage.removeItem('emptyValData');
        let emptyValDataString = JSON.stringify(emptyValData);
        localStorage.setItem('emptyValData', emptyValDataString);

        localStorage.removeItem('suggestionData');
        let suggestionDataString = JSON.stringify(suggestionData);
        localStorage.setItem('suggestionData', suggestionDataString);
    });
});

function showOutputData() {

    $('#suggestionBlock').html('');
        
    let suggestionHtml = ``;
    for (let key in suggestionData) {
        
        let bucketA='';
        let bucketB='';
        let bucketC='';
        let bucketD='';
        let bucketE='';
        let suggestData = suggestionData[key];

        if (Object.keys(suggestData.bucketA).length  > 0) {
            let isNotEmpty = false;
            bucketA = `<li>Bucket A: Place`;
            for (let ballk in suggestData.bucketA) {
                if(suggestData.bucketA[ballk] > 0){
                    let data = suggestData.bucketA[ballk];   
                    bucketA +=` ${data} ${ballk} balls, `;
                    isNotEmpty = true;
                }
            }
            bucketA +=`</li>`;

            if(!isNotEmpty) {
                bucketA ='';
            }
        }
        if (Object.keys(suggestData.bucketB).length > 0) {
            let isNotEmpty = false;
            bucketB = `<li>Bucket B: Place`;
            for (let ballk in suggestData.bucketB) {
                if(suggestData.bucketB[ballk] > 0){
                    let data = suggestData.bucketB[ballk];   
                    bucketB +=` ${data} ${ballk} balls, `;
                    isNotEmpty = true;
                }
            }
            bucketB +=`</li>`;
            if(!isNotEmpty) {
                bucketB ='';
            }
        }
        if (Object.keys(suggestData.bucketC).length > 0) {
            let isNotEmpty = false;
            bucketC = `<li>Bucket C: Place`;
            for (let ballk in suggestData.bucketC) {
                if(suggestData.bucketC[ballk] > 0){
                    let data = suggestData.bucketC[ballk];   
                    bucketC +=` ${data} ${ballk} balls, `;
                    isNotEmpty = true;
                }
            }
            bucketC +=`</li>`;
            if(!isNotEmpty) {
                bucketC ='';
            }
        }

        if (Object.keys(suggestData.bucketD).length > 0) {
            let isNotEmpty = false;

            bucketD = `<li>Bucket D: Place`;
            for (let ballk in suggestData.bucketD) {
                if(suggestData.bucketD[ballk] > 0){
                    let data = suggestData.bucketD[ballk];   
                    bucketD +=` ${data} ${ballk} balls, `;
                    isNotEmpty = true;
                }
            }
            bucketD +=`</li>`;
            if(!isNotEmpty) {
                bucketD ='';
            }
        }
        if (Object.keys(suggestData.bucketE).length > 0) {
            let isNotEmpty = false;

            bucketE = `<li>Bucket E: Place`;
            for (let ballk in suggestData.bucketE) {
                if(suggestData.bucketE[ballk] > 0){
                    let data = suggestData.bucketE[ballk];   
                    bucketE +=` ${data} ${ballk} balls, `;
                    isNotEmpty = true;
                }
            }

            bucketE +=`</li>`;

            if(!isNotEmpty) {
                bucketE ='';
            }
        }
        
        suggestionHtml += `${bucketA}${bucketB}${bucketC}${bucketD}${bucketE}`;
        suggestionHtml +=`<hr/>`;
    }
    
    $('#suggestionBlock').html(suggestionHtml);

    $('#emptyVolumeBlock').html('');
    let emptyVolHtml = `<li><span>Bucket A:</span>${emptyValData.bucketA} cubic inches</li><li><span>Bucket B:</span>${emptyValData.bucketB} cubic inches</li><li><span>Bucket C:</span>${emptyValData.bucketC} cubic inches</li><li><span>Bucket D:</span>${emptyValData.bucketD} cubic inches</li><li><span>Bucket E:</span>${emptyValData.bucketE} cubic inches</li>`;

    $('#emptyVolumeBlock').html(emptyVolHtml);
}