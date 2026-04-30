const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f7f8fb] px-6 py-8 text-slate-900">
      <div className="h-9" />

      <main className="flex min-h-[calc(100vh-92px)] items-center justify-center">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
