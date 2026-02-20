import React from 'react'
import { Box } from "lucide-react";
import Button from "./Button";
import { useOutletContext } from 'react-router';

const Navbar = () => {
    const { isSignedIn, userName, signIn, signOut } = useOutletContext<AuthContext>()

    async function handleAuthClick() {
        if (isSignedIn) {
            try {
                await signOut()
            } catch (error) {
                console.error(`puter sign out failed ${error}`)
            }

            return
        }

        try {
            await signIn()
        } catch (error) {
            console.error(`puter sign in failed ${error}`)
        }
    }

    return (
        <header className='navbar'>
            <nav className={'inner'}>
                <div className='left'>
                    <div className={'brand'}>
                        <Box className={'logo'} />

                        <span className={'name'}>
                            Roomroom
                        </span>
                    </div>

                    <ul className={'links'}>
                        <a href={''}>Product</a>
                        <a href={''}>Pricing</a>
                        <a href={''}>Community</a>
                        <a href={''}>Enterprise</a>
                    </ul>
                </div>

                <div className={'actions'}>
                    {
                        isSignedIn ? (
                            <>
                                <span className={'greeting'}>
                                    {userName ? `\`Hi, ${userName}` : 'Signed in'}
                                </span>

                                <Button size={'sm'} onClick={handleAuthClick} className={'btn'}>
                                    Log Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button className={'login'} size={'sm'} variant={'ghost'} onClick={handleAuthClick}>
                                    Login
                                </Button>

                                <a href={'#upload'} className={'cta'}>
                                    Get Started
                                </a>
                            </>
                        )
                    }
                </div>
            </nav>
        </header>
    )
}
export default Navbar
