"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./database";

export default function HomeRedirect() {
	const router = useRouter();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				router.replace("/dasbord");
			} else {
				router.replace("/home");
			}
		});

		return () => unsubscribe();
	}, [router]);

	return (
		<div className="flex items-center justify-center h-screen text-xl font-semibold">
			Loading...
		</div>
	);
}
