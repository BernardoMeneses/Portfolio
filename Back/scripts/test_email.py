import smtplib

def test_email_connection():
    # Credenciais diretas para teste (só para debugar)
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    sender_email = "bernardojvmeneses@gmail.com"
    sender_password = "qhom gepf lgjl zikm"  # Da tua .env
    
    try:
        print(f"Testando conexão com:")
        print(f"Servidor: {smtp_server}:{smtp_port}")
        print(f"Email: {sender_email}")
        print(f"Senha: {'*' * len(sender_password)}")
        print()
        
        # Tentar conectar
        print("Conectando ao servidor...")
        server = smtplib.SMTP(smtp_server, smtp_port)
        
        print("Iniciando TLS...")
        server.starttls()
        
        print("Fazendo login...")
        server.login(sender_email, sender_password)
        
        print("✅ LOGIN SUCESSO! As credenciais estão corretas.")
        server.quit()
        
    except Exception as e:
        print(f"❌ ERRO: {e}")
        print()
        print("Possíveis soluções:")
        print("1. Gerar nova senha de aplicativo no Gmail")
        print("2. Verificar se verificação em 2 etapas está ativa")
        print("3. Verificar se a senha foi copiada corretamente")
        print("4. Tentar desativar/reativar senhas de aplicativo")

if __name__ == "__main__":
    test_email_connection()
