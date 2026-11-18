// Run every test in the user's real timezone so DST tests are meaningful.
export default function setup(): void {
  process.env.TZ = 'Europe/Rome';
}
