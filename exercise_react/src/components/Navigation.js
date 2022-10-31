import React from 'react';
import { Link } from 'react-router-dom';

function Navigation() {
    return (
        <nav>
            <Link class="App-link" to="/"> Home </Link> |
            <Link class="App-link" to="/add-exercise"> Add </Link>
        </nav>
    );
}

export default Navigation; 