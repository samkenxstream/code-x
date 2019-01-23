
var UserAuthenticationModule = (function () {

    /****************************************************************************************
        User Logoff : Logoff from current session 
                    : Redirect to Home Page 
    *****************************************************************************************/

    function processLogoff(event) {

        alert("Logging out from TF Website");

        document.getElementById("Content-Navigation-bar").style.display = "none";
        document.getElementById("Login-Navigation-bar").style.display = "initial";
        document.location.replace("./TradeFinanceHome.html");
    }

    /****************************************************************************************
        Reveal private methods 
    *****************************************************************************************/

    return {

        processLogOffEvent: processLogoff
    };

})();
