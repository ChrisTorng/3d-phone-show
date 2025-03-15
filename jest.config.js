module.exports = {
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/js/__tests__/mocks/styleMock.js',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|glb|gltf)$': '<rootDir>/js/__tests__/mocks/fileMock.js'
    },
    setupFilesAfterEnv: ['<rootDir>/js/__tests__/setup.js'],
    testMatch: ['**/js/__tests__/**/*.test.js'],
    verbose: true
};