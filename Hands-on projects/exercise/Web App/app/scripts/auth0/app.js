window.addEventListener('load', function() {
  var content = document.querySelector('.content');
  var loadingSpinner = document.getElementById('loading');
  content.style.display = 'block';
  loadingSpinner.style.display = 'none';

  var webAuth = new auth0.WebAuth({
    domain: AUTH0_DOMAIN,
    clientID: AUTH0_CLIENT_ID,
    redirectUri: AUTH0_CALLBACK_URL,
    audience: 'http://localhost:3000',
    responseType: 'token id_token',
    scope: 'openid email profile',
    leeway: 60
  });

  var loginStatus = document.querySelector('.container h4');
  var loginView = document.getElementById('login-view');
  var homeView = document.getElementById('home-view');

  // buttons and event listeners
  var homeViewBtn = document.getElementById('btn-home-view');
  var loginBtn = document.getElementById('btn-login');
  var logoutBtn = document.getElementById('btn-logout');

  homeViewBtn.addEventListener('click', function() {
    homeView.style.display = 'inline-block';
    loginView.style.display = 'none';
  });

  loginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    webAuth.authorize();
  });

  logoutBtn.addEventListener('click', logout);

  function setSession(authResult) {
    // Set the time that the access token will expire at
    var expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }

  function logout() {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    displayButtons();
    webAuth.authorize(function (err, result) {
      if (!err) {
        handleAuthentication();
      }
    });
  }

  function isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    var expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

  function handleAuthentication() {
    webAuth.parseHash(function(err, authResult) {
      if (authResult && authResult.accessToken && authResult.idToken) {
        console.log(authResult);
        window.location.hash = '';
        setSession(authResult);
        loginBtn.style.display = 'none';
        homeView.style.display = 'inline-block';
        getProfile();
        getData();
      } else {
        if (err) {
          homeView.style.display = 'inline-block';
          console.log(err);
          alert(
            'Error: ' + err.error + '. Check the console for further details.'
          );
        } else {
          getProfile();
          getData();
        }
      }
      displayButtons();
    });
  }

  function displayButtons() {
    if (isAuthenticated()) {
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'inline-block';
      loginStatus.innerHTML = 'You are logged in!';
    } else {
      loginBtn.style.display = 'inline-block';
      logoutBtn.style.display = 'none';
      loginStatus.innerHTML =
        'You are not logged in! Please log in to continue.';
    }
  }
    var userProfile;

    function getProfile() {
        if (!userProfile) {
            var accessToken = localStorage.getItem('access_token');

            if (!accessToken) {
                console.log('Access token must exist to fetch profile');
            }

            webAuth.client.userInfo(accessToken, function(err, profile) {
                if (profile) {
                    userProfile = profile;
                    displayProfile();
                }
            });
        } else {
            displayProfile();
        }
    }

    function displayProfile() {
        // display the profile
        document.querySelector('#profile-view .nickname').innerHTML =
            userProfile.nickname;

        document.querySelector(
            '#profile-view .full-profile'
        ).innerHTML = JSON.stringify(userProfile, null, 2);

        document.querySelector('#profile-view img').src = userProfile.picture;
    }

    function getData() {
      var headers = {
        'Authorization' : 'Bearer ' + localStorage.getItem('access_token'),
        'Content-type' : 'application/json',
        'Accept' : 'application/json'
      };
      debugger
      var method = 'post';
      var body = {};

      var settings = {
        method : method,
        headers : headers,
        body : body
      };
      var url = 'http://localhost:3000/unicorns';

      fetch(url, settings)
        .then(function (res) {
          if (res.status == 200)
            return res.json();
          else
            throw Error();
        })
        .then(function (json) {
          console.log(json);
          document.querySelector('#data-view').style.display = 'block';
          document.querySelector(
            '#data-view .full-data'
          ).innerHTML = JSON.stringify(json, null, 4);
          handleUnicornData(json);
        })
    }

    function handleUnicornData(data) {
      var res = [];
      var series2 = [];
      for (var i = 0; i < data.length; i++) {
        if (data[i].name)
          res.push({name: data[i].name, y: (data[i].score ? data[i].score : 0)});
          series2.push({name: data[i].name, y: (data[i].loves ? data[i].loves.length : 0)})
      }
      Highcharts.chart('container', {
        chart: {
          type: 'column'
        },
        title: {
          text: 'Unicorn data'
        },
        xAxis: {
          type: 'category'
        },
        yAxis: [{
          title: {
            text: 'Total score'
          }

        }, { // Primary yAxis
          title: {
            text: 'Loves (number)'
          },
          opposite: true

        }],
        legend: {
          enabled: true
        },
        plotOptions: {
          series: {
            borderWidth: 0,
            dataLabels: {
              enabled: true,
              format: '{point.y}'
            }
          }
        },



        series: [{
          name: 'Score',
          tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b> score<br/>'
          },
          data: res
        }, {
          name : 'Loves',
          yAxis : 1,
          tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b> count<br/>'
          },
          data : series2
        }]
      });
    }

    function getAccessTokenfromParent() {
      var splittedUrl = window.parent.location.href.split('#access_token=');
      if (splittedUrl.length == 2){
        return splittedUrl[1];
      }
      return null;
    }

    if (!isAuthenticated() && !getAccessTokenfromParent()) {
      webAuth.authorize(function (err, result) {
        if (!err) {
          handleAuthentication();
        }
      });
    }
  handleAuthentication();
});
