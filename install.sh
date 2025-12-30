#!/bin/bash

echo "Installing dependencies..."
npm ci
echo "Dependencies installed"
echo "Installing lib dependencies..."
cd lib && npm ci
echo "Lib dependencies installed"