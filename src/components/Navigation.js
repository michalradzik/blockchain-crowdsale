
import logo from '../logo.png';

const Navigation = () => (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
            <a className="navbar-brand" href="/">
                <img src={logo} alt="Logo" width="50" height="50" className="d-inline-block align-top" />
                {' '}
                DApp Token Sale
            </a>
        </div>
    </nav>
);

export default Navigation;
