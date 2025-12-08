// Fichier de diagnostic - À SUPPRIMER après débogage
// Usage: Importe dans un composant et appelle checkAuthDebug()

export const checkAuthDebug = () => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    console.log('=== AUTH DEBUG ===');
    console.log('Token exists:', !!token);
    console.log('User data:', user);
    console.log('User role:', user?.role);
    console.log('Role type:', typeof user?.role);
    console.log('Is SUPERADMIN:', user?.role === 'SUPERADMIN');
    console.log('Is ADMIN:', user?.role === 'ADMIN');
    
    return {
        hasToken: !!token,
        user,
        roleValue: user?.role,
        isSuperAdmin: user?.role === 'SUPERADMIN',
        isAdmin: user?.role === 'ADMIN'
    };
};

// Appelle cette fonction dans le composant Login ou App après connexion
// checkAuthDebug();
