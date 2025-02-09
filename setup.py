from setuptools import setup, find_packages

setup(
    name="ml-pipeline",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "sqlalchemy>=2.0.0",
        "PyMySQL>=1.1.0",
        "cryptography>=41.0.0",
        "pydantic>=2.5.0",
        "pydantic-settings>=2.1.0",
        "python-dotenv>=1.0.0",
        "boto3>=1.34.0",
        "alembic>=1.13.0",
        "fastapi>=0.109.0",
        "uvicorn>=0.27.0",
        "email-validator>=2.1.0",
        "python-multipart>=0.0.6",
        "pandas>=2.1.0",
        "numpy>=1.24.0",
        "scikit-learn>=1.3.0"
    ],
    python_requires=">=3.9",
) 