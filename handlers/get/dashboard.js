export default function handler(request, response) {
    response.render('dashboard', {
        headTitle: 'Dashboard'
    });
}
