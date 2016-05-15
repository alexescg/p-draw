/**
 * Created by alex on 4/10/16.
 */
if (process.env['NODE_ENV'] === 'production') {

    var facebookAuth = {
        'clientID': '718225018320239', // your App ID
        'clientSecret': '90ec569e796ee7bde15ae95ced8553be', // your App Secret
        'callbackURL': 'http://localhost:' + process.env.PORT || 8080 + '/auth/facebook/callback'
    };

    var twitterAuth = {

        'consumerKey': 'cRgoBp4d3rMie80LhiauWtmDS',
        'consumerSecret': 'QhBA7HNNVYnz1zgzqbEvm1izSj5E3uJI0CU3btFBHdcSpUR096',
        'callbackURL': 'http://scrumteam-1.herokuapp.com/auth/twitter/callback'
    };

    var googleAuth = {
        'clientID': '863247138013-23phfl217jvsea5t4ttnlocvp6p2eopi.apps.googleusercontent.com',
        'clientSecret': 'MEpzZoGb1kdN7WQtLnj4Jhi7',
        'callbackURL': 'http://scrumteam-1.herokuapp.com/auth/google/callback'
    };
} else {

    var facebookAuth = {
        'clientID': '718225018320239', // your App ID
        'clientSecret': '90ec569e796ee7bde15ae95ced8553be', // your App Secret
        'callbackURL': 'http://localhost:8080/auth/facebook/callback'
    };

    var twitterAuth = {

        'consumerKey': 'cRgoBp4d3rMie80LhiauWtmDS',
        'consumerSecret': 'QhBA7HNNVYnz1zgzqbEvm1izSj5E3uJI0CU3btFBHdcSpUR096',
        'callbackURL': 'http://localhost:8080/auth/twitter/callback'
    };

    var googleAuth = {
        'clientID': '863247138013-23phfl217jvsea5t4ttnlocvp6p2eopi.apps.googleusercontent.com',
        'clientSecret': 'MEpzZoGb1kdN7WQtLnj4Jhi7',
        'callbackURL': 'http://localhost:8080/auth/google/callback'
    };

}


module.exports = {

    'facebookAuth': facebookAuth,
    'twitterAuth': twitterAuth,
    'googleAuth': googleAuth

};