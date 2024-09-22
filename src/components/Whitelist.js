import { useState, useEffect } from 'react';  // Dodaj import useEffect
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';

const Whitelist = ({ provider, crowdsale }) => {
    const [address, setAddress] = useState('');
    const [isWaiting, setIsWaiting] = useState(false);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        const checkOwner = async () => {
            const signer = await provider.getSigner();
            const signerAddress = await signer.getAddress();
            const contractOwner = await crowdsale.owner();
            if (signerAddress === contractOwner) {
                setIsOwner(true);
            }
        };
        checkOwner(); // Wywołaj funkcję sprawdzania właściciela wewnątrz useEffect
    }, [provider, crowdsale]);  // Zależy od `provider` i `crowdsale`

    const addToWhitelistHandler = async (e) => {
        e.preventDefault();
        setIsWaiting(true);
        try {
            const signer = await provider.getSigner();
            const transaction = await crowdsale.connect(signer).addToWhitelist(address);
            await transaction.wait();
            window.alert(`${address} has been added to the whitelist!`);
        } catch (error) {
            console.error('Transaction error:', error);
            window.alert('Failed to add to whitelist.');
        }
        setIsWaiting(false);
    };

    return (
        <>
            {isOwner ? (
                <Form onSubmit={addToWhitelistHandler} style={{ maxWidth: '800px', margin: '50px auto' }}>
                    <Form.Group as={Row}>
                        <Col>
                            <Form.Control
                                type="text"
                                placeholder="Enter address to whitelist"
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </Col>
                        <Col className="text-center">
                            {isWaiting ? (
                                <Spinner animation="border" />
                            ) : (
                                <Button variant="primary" type="submit" style={{ width: '100%' }}>
                                    Add to Whitelist
                                </Button>
                            )}
                        </Col>
                    </Form.Group>
                </Form>
            ) : (
                <p className="text-center text-danger">You are not the owner.</p>
            )}
        </>
    );
};

export default Whitelist;
