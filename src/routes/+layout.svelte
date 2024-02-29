<script>
    import {onMount} from "svelte";
    import { auth, db } from "$lib/firebase/firebase";
    import { getDoc, doc, setDoc } from "firebase/firestore";
    import "../app.css";
    import { authStore } from "../store/store";
    import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';


    const nonAuthRoutes = ["/"];



    onMount(() => {
        console.log("Mounting");
        
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            const currentPath = window.location.pathname;
            
            if(!user && !nonAuthRoutes.includes(currentPath)) {
                window.location.href = "/";
                return;
            };

            if (user && currentPath === "/") {
                window.location.href = "main/dashboard";
                return;
            };

            if (!user) {
                return;
            }

            // @ts-ignore
            let dataToSetToStore;

            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                const userRef = doc(db, "user", user.uid);
                dataToSetToStore = {
                    email: user.email,
                    username: user.displayName,
                    GBP: 100,
                    EUR: 0,
                    USD: 0,
                    JPY: 0,
                }
                await setDoc(
                    userRef,
                    dataToSetToStore,
                    {merge: true}
                ); 
            } else {
                const userData = docSnap.data()
                dataToSetToStore = userData;
            }
            // @ts-ignore
            authStore.update((current) => {
                return{
                    ...current,
                    user,
                    // @ts-ignore
                    data: dataToSetToStore,
                    loading: false,
                }
            })

        });
    });

</script>

<div class="bg-gradient-to-br from-midnight-blue to-midnight-purple h-screen overflow-y-scroll">
    <slot></slot>
</div>
